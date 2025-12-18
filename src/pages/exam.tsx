import { createRoute, Navigate, useNavigate } from "@tanstack/react-router";
import {
  Box,
  Center,
  Flex,
  IconButton,
  Spinner,
  Text,
  Button,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { CloseRequestedEvent } from "@tauri-apps/api/window";
import { confirm } from "@tauri-apps/plugin-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";

import { usePreventImmediateExit } from "../components/use-prevent-immediate-exit";
import { getGeneratedExam, postExamAttempt } from "../utils/fetch";
import { QuestionSetForm } from "../components/question-set-form";
import { ProtectedRoute } from "../components/protected-route";
import { LandingRoute } from "./landing";
import { rootRoute } from "./root";
import { Answers, FullQuestion, UserExamAttempt } from "../utils/types";
import { getErrorMessage } from "../utils/errors";
import { ExamSubmissionModal } from "../components/exam-submission-modal";
import { QuestionSubmissionErrorModal } from "../components/question-submission-error-modal";
import { produce } from "immer";

export function Exam() {
  const { examId } = ExamRoute.useParams();
  const examQuery = useQuery({
    queryKey: ["exam", examId],
    // TODO: If page is "reloaded" once an exam has ended, this could error with "User has completed exam too recently to retake."
    queryFn: () => getGeneratedExam(examId),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const {
    isOpen: questionSubmissionErrorModalIsOpen,
    onOpen: questionSubmissionErrorModalOnOpen,
    onClose: questionSubmissionErrorModalOnClose,
  } = useDisclosure();
  const submitQuestionMutation = useMutation({
    mutationFn: async ({
      fullQuestion,
      selectedAnswers,
    }: {
      fullQuestion: FullQuestion;
      selectedAnswers: Answers[number]["id"][];
    }) => {
      const updatedAttempt = produce(examAttempt, (draft) => {
        if (!draft) return;
        let qs = draft.questionSets.find(
          (q) => q.id === fullQuestion.questionSet.id
        );

        if (!qs) {
          draft.questionSets.push({
            id: fullQuestion.questionSet.id,
            questions: [{ id: fullQuestion.id, answers: selectedAnswers }],
          });
        } else {
          const q = qs.questions.find((q) => q.id === fullQuestion.id);
          if (q) q.answers = selectedAnswers;
          else
            qs.questions.push({
              id: fullQuestion.id,
              answers: selectedAnswers,
            });
        }
      });

      if (!updatedAttempt) throw new Error("Attempt not found");

      await postExamAttempt(updatedAttempt);

      return updatedAttempt;
    },
    onError(error) {
      console.log(error);
      questionSubmissionErrorModalOnOpen();
    },
    onSuccess(updatedAttempt) {
      setExamAttempt(updatedAttempt);
      setNewSelectedAnswers([]);

      if (currentQuestionNumber < questions.length) {
        const nextId = questions[currentQuestionNumber].id;
        setActiveQuestionId(nextId);
      }

      if (questionSubmissionErrorModalIsOpen) {
        questionSubmissionErrorModalOnClose();
      }
      // nextQuestion();
    },
  });

  const [examAttempt, setExamAttempt] = useState<UserExamAttempt | null>(null);
  const [newSelectedAnswers, setNewSelectedAnswers] = useState<
    Answers[number]["id"][]
  >([]);

  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  const [maxTimeReached, setMaxTimeReached] = useState(false);
  const [hasFinishedExam, setHasFinishedExam] = useState(false);

  const scrollableElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!examQuery.data || activeQuestionId) {
      return;
    }
    const attempt = examQuery.data.examAttempt;
    setExamAttempt(attempt);

    // Determine the starting question (last answered or first)
    const lastQs = attempt.questionSets.at(-1);
    const lastQ = lastQs?.questions.at(-1);

    if (lastQ) {
      setActiveQuestionId(lastQ.id);
    } else {
      setActiveQuestionId(examQuery.data.exam.questionSets[0].questions[0].id);
    }
  }, [examQuery.data]);

  async function onCloseRequested(event: CloseRequestedEvent) {
    const confirmed = await confirm(
      "Are you sure you want to exit?\n\nYou will not be able to immediately retake the exam."
    );
    if (!confirmed) {
      event.preventDefault();
    }
  }

  usePreventImmediateExit({
    onCloseRequested,
  });

  const questions = useMemo(
    () =>
      examQuery.data?.exam?.questionSets?.flatMap((qt) => qt.questions) || [],
    [examQuery.data?.exam]
  );

  function nextQuestion() {
    const nextQ = questions[currentQuestionNumber];

    if (!nextQ) {
      return;
    }

    const questionSet = examQuery.data?.exam.questionSets.find((qt) =>
      qt.questions.some((q) => q.id === nextQ.id)
    );
    if (!questionSet) {
      return;
    }

    const next = {
      ...nextQ,
      questionSet,
    };

    setActiveQuestionId(next.id);
  }

  function specificQuestion(questionId: string) {
    const specificQ = questions.find((q) => q.id === questionId);

    if (!specificQ) {
      return;
    }

    const questionSet = examQuery.data?.exam.questionSets.find((qt) =>
      qt.questions.some((q) => q.id === specificQ.id)
    );

    if (!questionSet) {
      return;
    }

    const specific = {
      ...specificQ,
      questionSet,
    };
    setActiveQuestionId(specific.id);
  }

  function previousQuestion() {
    const prevQ = questions[currentQuestionNumber - 2];

    if (!prevQ) {
      return;
    }

    const questionSet = examQuery.data?.exam.questionSets.find((qt) =>
      qt.questions.some((q) => q.id === prevQ.id)
    );
    if (!questionSet) {
      return;
    }

    const prev = {
      ...prevQ,
      questionSet,
    };
    setActiveQuestionId(prev.id);
  }

  function answeredAll() {
    if (!fullQuestion || !examAttempt) {
      return false;
    }

    const answeredQuestions = examAttempt.questionSets
      .map((qt) => qt.questions.map((question) => question.id))
      .flat();
    const allQuestionIds = questions.map((question) => question.id);

    for (let i = 0; i < allQuestionIds.length; i++) {
      if (!answeredQuestions.includes(allQuestionIds[i])) {
        return false;
      }
    }
    return true;
  }

  function handleExamEnd() {
    setHasFinishedExam(true);
  }

  const answeredQuestionIds = useMemo(() => {
    if (!examAttempt) return new Set<string>();
    return new Set(
      examAttempt.questionSets.flatMap((qs) => qs.questions.map((q) => q.id))
    );
  }, [examAttempt]);

  const isAnswered = useCallback(
    (questionId: string) => {
      return answeredQuestionIds.has(questionId);
    },
    [answeredQuestionIds]
  );

  const fullQuestion = useMemo(() => {
    if (!activeQuestionId || !examQuery.data) return null;
    const question = questions.find((q) => q.id === activeQuestionId);
    const questionSet = examQuery.data.exam.questionSets.find((qs) =>
      qs.questions.some((q) => q.id === activeQuestionId)
    );
    return question && questionSet ? { ...question, questionSet } : null;
  }, [activeQuestionId, questions, examQuery.data]);

  const currentQuestionNumber = useMemo(
    () => questions.findIndex((q) => q.id === activeQuestionId) + 1,
    [questions, activeQuestionId]
  );

  if (examQuery.isPending) {
    return (
      <Box overflowY="hidden">
        <Box width={"full"} mt="2em">
          <Center>
            <Spinner
              alignSelf={"center"}
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="var(--dark-blue)"
              size="xl"
            />
          </Center>
        </Box>
      </Box>
    );
  }

  if (examQuery.isError) {
    return (
      <Navigate
        to={LandingRoute.to}
        search={{
          flashKind: "warning",
          flashMessage: getErrorMessage(examQuery.error),
        }}
      />
    );
  }

  if (!examAttempt || !fullQuestion) {
    return (
      <Box overflowY="hidden">
        <Box width={"full"} mt="2em">
          <Center>
            <Spinner
              alignSelf={"center"}
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="var(--dark-blue)"
              size="xl"
            />
          </Center>
        </Box>
      </Box>
    );
  }

  const startTimeInMS = examAttempt.startTime.getTime();
  const totalTimeInMS =
    (examQuery.data?.exam?.config?.totalTimeInS ?? 0) * 1000;
  const secondsLeft = Math.floor(
    (startTimeInMS + totalTimeInMS - Date.now()) / 1000
  );

  const scrollBarWidth =
    (scrollableElementRef.current?.offsetWidth ?? 0) -
    (scrollableElementRef.current?.clientWidth ?? 0);

  const allQuestionsAnswered = answeredAll();

  return (
    <>
      <ExamSubmissionModal
        maxTimeReached={maxTimeReached}
        hasFinishedExam={hasFinishedExam}
        setHasFinishedExam={setHasFinishedExam}
      />
      <QuestionSubmissionErrorModal
        {...{
          submitQuestionMutation,
          fullQuestion,
          newSelectedAnswers,
          questionSubmissionErrorModalIsOpen,
          questionSubmissionErrorModalOnClose,
        }}
      />
      <Box overflowY="hidden" as="main" id="main-content">
        <Box width={"full"} mt="2em">
          <Center height={"100%"} display={"flex"} flexDirection={"column"}>
            <Center width="full" borderBottom={"2px"} borderColor={"gray.300"}>
              <Flex justifyContent={"space-between"} width={"65vw"}>
                <Text
                  fontWeight={"bold"}
                >{`Question ${currentQuestionNumber} of ${questions.length}`}</Text>
                <Timer
                  secondsLeft={secondsLeft}
                  setHasFinishedExam={setHasFinishedExam}
                  setMaxTimeReached={setMaxTimeReached}
                />
              </Flex>
            </Center>
            <Box
              display={"flex"}
              flexDirection={"column"}
              alignItems={"center"}
              width={"full"}
              height={"77vh"}
              overflowY="scroll"
              ref={scrollableElementRef}
              paddingLeft={`${scrollBarWidth}px`}
              paddingTop={"1rem"}
            >
              <QuestionSetForm
                fullQuestion={fullQuestion}
                examAttempt={examAttempt}
                setNewSelectedAnswers={setNewSelectedAnswers}
                newSelectedAnswers={newSelectedAnswers}
              />
            </Box>
          </Center>
        </Box>

        <Box
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          borderTop={"2px"}
          borderColor={"gray.300"}
          paddingTop={"1rem"}
          flexWrap={"wrap"}
          flexDirection={"column"}
          overflowX={"hidden"}
        >
          <Flex width={"65%"}>
            <Tooltip
              label="Answer all questions to submit"
              isDisabled={allQuestionsAnswered}
            >
              <Button
                onClick={handleExamEnd}
                isDisabled={!allQuestionsAnswered}
                marginRight="0.4em"
                width={"50%"}
                backgroundColor={
                  allQuestionsAnswered ? "rgb(48, 48, 204)" : undefined
                }
                color={allQuestionsAnswered ? "white" : undefined}
                _hover={
                  allQuestionsAnswered
                    ? {
                        color: "blue",
                        background: "gray.300",
                      }
                    : undefined
                }
              >
                Submit Exam
              </Button>
            </Tooltip>
            <Button
              width={"50%"}
              onClick={() => {
                if (fullQuestion && newSelectedAnswers.length > 0) {
                  submitQuestionMutation.mutate({
                    fullQuestion,
                    selectedAnswers: newSelectedAnswers,
                  });
                }
              }}
              isDisabled={
                !newSelectedAnswers.length || maxTimeReached
                // submitQuestionMutation.isPending
              }
              backgroundColor={
                !allQuestionsAnswered ? "rgb(48, 48, 204)" : undefined
              }
              color={!allQuestionsAnswered ? "white" : undefined}
              _hover={
                !allQuestionsAnswered
                  ? {
                      color: "blue",
                      background: "gray.300",
                    }
                  : undefined
              }
              marginLeft="0.4em"
              isLoading={submitQuestionMutation.isPending}
              loadingText="Submitting"
            >
              Submit Question
            </Button>
          </Flex>
          <NavigationBubbles
            questions={questions}
            currentQuestionNumber={currentQuestionNumber}
            specificQuestion={specificQuestion}
            isAnswered={isAnswered}
            nextQuestion={nextQuestion}
            previousQuestion={previousQuestion}
          />
        </Box>
      </Box>
    </>
  );
}

type TimerProps = {
  secondsLeft: number;
  setHasFinishedExam: (b: boolean) => void;
  setMaxTimeReached: (b: boolean) => void;
};

type NavigationBubblesProps = {
  questions: any[];
  currentQuestionNumber: number;
  specificQuestion: (id: string) => void;
  isAnswered: (questionId: string) => boolean;
  nextQuestion: () => void;
  previousQuestion: () => void;
};

function Timer({
  secondsLeft,
  setHasFinishedExam,
  setMaxTimeReached,
}: TimerProps) {
  const [announcement, setAnnouncement] = useState("");
  const [availableTime, setAvailableTime] = useState(secondsLeft);
  const startTimeRef = useRef<Date | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = new Date();

    const updateTimer = () => {
      let timeLeft = 0;
      if (startTimeRef.current) {
        const elapsed = Math.floor(
          (new Date().getTime() - startTimeRef.current.getTime()) / 1000
        );
        timeLeft = Math.max(secondsLeft - elapsed, 0);

        if (timeLeft === 0) {
          setHasFinishedExam(true);
          setMaxTimeReached(true);
        }

        setAvailableTime(timeLeft);
      }

      if (timeLeft > 0) {
        requestRef.current = requestAnimationFrame(updateTimer);
      }
    };

    requestRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [secondsLeft]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === "t") {
        event.preventDefault();

        const timeString = secondsToHHMMSS(availableTime);
        setAnnouncement(`Time left: ${timeString}`);

        // Clear the announcement after a short delay so the screen reader
        // can announce it again the next time the shortcut is pressed.
        setTimeout(() => setAnnouncement(""), 100);
      }
    },
    [availableTime]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <>
      <Text
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          clip: "rect(0 0 0 0)",
          width: 1,
          height: 1,
          margin: -1,
          padding: 0,
          border: 0,
          overflow: "hidden",
        }}
      >
        {announcement}
      </Text>
      <Text fontWeight={"bold"} aria-live="off" aria-atomic="true">
        Time: {secondsToHHMMSS(availableTime)}
      </Text>
    </>
  );
}

function NavigationBubbles({
  questions,
  currentQuestionNumber,
  specificQuestion,
  isAnswered,
  nextQuestion,
  previousQuestion,
}: NavigationBubblesProps) {
  const maxIndex = Math.ceil(questions.length / 10) - 1;
  const currIndex = Math.floor((currentQuestionNumber - 1) / 10);
  const [wantedIndex, setWantedIndex] = useState(0);

  useEffect(() => {
    if (currentQuestionNumber > 10) {
      setWantedIndex(currIndex);
    } else {
      setWantedIndex(0);
    }
  }, [currentQuestionNumber]);

  function getCurrentBubbleIndex(wantedIndex: number = 0) {
    const bubbleArr: number[][] = [[]];
    let currentBubbleIndex = 0;

    for (let i = 0; i < questions.length; i++) {
      const isTenth = i % 10 === 0 && i !== 0;

      if (isTenth) {
        currentBubbleIndex++;
        bubbleArr[currentBubbleIndex] = [];
        bubbleArr[currentBubbleIndex].push(i + 1);
      } else {
        bubbleArr[currentBubbleIndex].push(i + 1);
      }
    }

    return bubbleArr[wantedIndex];
  }

  const bubblesArr = getCurrentBubbleIndex(wantedIndex);

  return (
    <Flex
      width="80%"
      justifyContent={"center"}
      as="nav"
      aria-label="Question navigation"
    >
      <IconButton
        aria-label="Go to previous question"
        icon={<ChevronLeftIcon />}
        m={"0.3em"}
        isDisabled={currentQuestionNumber === 1}
        onClick={() => {
          previousQuestion();
        }}
      />
      <IconButton
        aria-label="Go to previous set of questions"
        icon={<ArrowLeftIcon />}
        m={"0.3em"}
        isDisabled={wantedIndex === 0}
        onClick={() => {
          setWantedIndex(wantedIndex - 1);
        }}
      />

      {bubblesArr.map((index) => {
        const question = questions[index - 1];
        const questionId = question.id;
        return (
          <Box
            key={questionId}
            onClick={() => {
              specificQuestion(questionId);
            }}
            _hover={{
              backgroundColor: "gray.200",
              color: "black",
            }}
            className={`bottom-bubble-nav ${
              currentQuestionNumber === index ? "bubble-active" : ""
            } ${isAnswered(questionId) ? "bubble-answered" : ""}`}
            role="button"
            tabIndex={0}
            aria-label={`Go to question ${index}${isAnswered(questionId) ? " (answered)" : ""}`}
            aria-current={currentQuestionNumber === index ? "page" : undefined}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                specificQuestion(questionId);
              }
            }}
          >
            <Text>{index.toString()}</Text>
          </Box>
        );
      })}
      <IconButton
        aria-label="Go to next set of questions"
        icon={<ArrowRightIcon />}
        m={"0.3em"}
        isDisabled={maxIndex == wantedIndex}
        onClick={() => {
          setWantedIndex(wantedIndex + 1);
        }}
      />
      <IconButton
        aria-label="Go to next question"
        icon={<ChevronRightIcon />}
        m={"0.3em"}
        isDisabled={currentQuestionNumber === questions.length}
        onClick={() => {
          nextQuestion();
        }}
      />
    </Flex>
  );
}

function secondsToHHMMSS(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const h = hours.toString().padStart(2, "0");
  const m = minutes.toString().padStart(2, "0");
  const s = seconds.toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export const ExamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/exam/$examId",
  component: () => (
    <ProtectedRoute>
      <Exam />
    </ProtectedRoute>
  ),
});
