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
} from "@chakra-ui/react";
import { useState, useEffect, useRef, useMemo } from "react";
import { CloseRequestedEvent } from "@tauri-apps/api/window";
import { confirm } from "@tauri-apps/plugin-dialog";
// import { Modal } from "@freecodecamp/ui";
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
import {
  Answers,
  FullQuestion,
  UserExam,
  UserExamAttempt,
} from "../utils/types";
import { captureAndNavigate } from "../utils/errors";
import { ExamSubmissionModal } from "../components/exam-submission-modal";
import { QuestionSubmissionErrorModal } from "../components/question-submission-error-modal";
import { captureException } from "@sentry/react";

export function Exam() {
  const { examId } = ExamRoute.useParams();
  const navigate = useNavigate();
  const examQuery = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => getGeneratedExam(examId),
    retry: false,
  });
  const submitQuestionMutation = useMutation({
    mutationFn: submitQuestion,
  });

  const [examAttempt, setExamAttempt] = useState<UserExamAttempt | null>(null);
  const [newSelectedAnswers, setNewSelectedAnswers] = useState<
    Answers[number]["id"][]
  >([]);

  const [fullQuestion, setFullQuestion] = useState<FullQuestion | null>(null);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);

  const [maxTimeReached, setMaxTimeReached] = useState(false);
  const [hasFinishedExam, setHasFinishedExam] = useState(false);

  const scrollableElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!examQuery.data) {
      return;
    }
    const exam = examQuery.data.exam;
    const examAttempt = examQuery.data.examAttempt;

    const fullQuestion = fullQuestionFromExamAttempt(exam, examAttempt);
    setFullQuestion(fullQuestion);
    setExamAttempt(examAttempt);
  }, [examQuery.data]);

  function fullQuestionFromExamAttempt(
    exam: UserExam,
    examAttempt: UserExamAttempt
  ): FullQuestion {
    const questionSets = examAttempt.questionSets;

    if (!questionSets.length) {
      const questionSet = exam.questionSets.at(0);

      if (!questionSet) {
        throw captureAndNavigate(
          `Unreachable. Exam ID: ${exam.examId}; No question sets found.`,
          navigate
        );
      }

      const question = questionSet.questions.at(0);

      if (!question) {
        throw captureAndNavigate(
          `Unreachable. Exam ID: ${exam.examId}; No question found in question set.`,
          navigate
        );
      }

      return {
        questionSet,
        ...question,
      };
    }
    const latestQuestionSet = questionSets.at(-1);

    if (!latestQuestionSet) {
      throw captureAndNavigate(
        `Unreachable. Exam ID: ${exam.examId}; No question set found.`,
        navigate
      );
    }

    const questionSet = exam.questionSets.find(
      (qs) => qs.id === latestQuestionSet.id
    );
    if (!questionSet) {
      throw captureAndNavigate(
        `Unreachable. Exam ID: ${exam.examId}; No question set found.`,
        navigate
      );
    }

    const latestQuestionSetQuestion = latestQuestionSet.questions.at(-1);

    if (!latestQuestionSetQuestion) {
      throw captureAndNavigate(
        `Unreachable. Exam ID: ${exam.examId}; No question found in set.`,
        navigate
      );
    }

    const latestQuestion = questionSet.questions.find(
      (q) => q.id === latestQuestionSetQuestion.id
    )!;
    const fullQuestion = {
      questionSet,
      ...latestQuestion,
    };

    return fullQuestion;
  }

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

  useEffect(() => {
    const cqn = questions.findIndex((q) => q.id === fullQuestion?.id) + 1;
    setCurrentQuestionNumber(cqn);
  }, [fullQuestion]);

  function nextQuestion() {
    if (!fullQuestion) {
      return;
    }

    const nextQ = questions[currentQuestionNumber];

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
    setFullQuestion(next);
  }

  function specificQuestion(question_num: number) {
    if (!fullQuestion) {
      return;
    }

    const specificQ = questions[question_num - 1];

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
    setFullQuestion(specific);
  }

  function previousQuestion() {
    if (!fullQuestion) {
      return;
    }

    const prevQ = questions[currentQuestionNumber - 2];
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
    setFullQuestion(prev);
  }

  function isAnswered(question_num: number) {
    if (!fullQuestion || !examAttempt) {
      return false;
    }

    const question = questions[question_num - 1];

    const questionSet = examAttempt.questionSets.find((qt) =>
      qt.questions.some((q) => q.id === question.id)
    );

    if (!questionSet) {
      return false;
    }

    const q = questionSet.questions.find((q) => q.id === question.id);

    return q !== undefined;
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

  async function submitQuestion({
    fullQuestion,
    selectedAnswers,
  }: {
    fullQuestion: FullQuestion;
    selectedAnswers: Answers[number]["id"][];
  }) {
    if (!examAttempt) {
      const error = new Error("Unreachable. Exam attempt should exist");
      captureException(error);
      throw error;
    }

    const questionSets = examAttempt.questionSets;
    const qs = questionSets.find((q) => q.id === fullQuestion.questionSet.id);
    if (qs) {
      const q = qs.questions.find((q) => q.id === fullQuestion.id);
      if (q) {
        q.answers = selectedAnswers;
      } else {
        qs.questions.push({ id: fullQuestion.id, answers: selectedAnswers });
      }
    } else {
      questionSets.push({
        id: fullQuestion.questionSet.id,
        questions: [{ id: fullQuestion.id, answers: selectedAnswers }],
      });
    }

    const updatedExamAttempt = {
      ...examAttempt,
      questionSets,
    };

    // TODO: Use response to determine next action
    await postExamAttempt(examAttempt);

    if (currentQuestionNumber < questions.length) {
      nextQuestion();
    }

    setExamAttempt(updatedExamAttempt);
  }

  function handleExamEnd() {
    setHasFinishedExam(true);
  }

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
          flashMessage: examQuery.error.message,
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
        submitQuestionMutation={submitQuestionMutation}
        fullQuestion={fullQuestion}
        newSelectedAnswers={newSelectedAnswers}
      />
      <Box overflowY="hidden">
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
                if (!newSelectedAnswers) {
                  return;
                }

                submitQuestionMutation.mutate({
                  fullQuestion,
                  selectedAnswers: newSelectedAnswers,
                });
              }}
              isDisabled={
                !newSelectedAnswers.length ||
                maxTimeReached ||
                submitQuestionMutation.isPending
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
  specificQuestion: (question_num: number) => void;
  isAnswered: (question_num: number) => boolean;
  nextQuestion: () => void;
  previousQuestion: () => void;
};

function Timer({
  secondsLeft,
  setHasFinishedExam,
  setMaxTimeReached,
}: TimerProps) {
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

  return (
    <Text fontWeight={"bold"}>Time: {secondsToHHMMSS(availableTime)}</Text>
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
    <Flex width="80%" justifyContent={"center"}>
      <IconButton
        aria-label="previous question"
        icon={<ChevronLeftIcon />}
        m={"0.3em"}
        isDisabled={currentQuestionNumber === 1}
        onClick={() => {
          previousQuestion();
        }}
      />
      <IconButton
        aria-label="previous set of questions"
        icon={<ArrowLeftIcon />}
        m={"0.3em"}
        isDisabled={wantedIndex === 0}
        onClick={() => {
          setWantedIndex(wantedIndex - 1);
        }}
      />

      {bubblesArr.map((question_num) => (
        <Box
          key={question_num}
          onClick={() => {
            specificQuestion(question_num);
          }}
          _hover={{
            backgroundColor: "gray.200",
            color: "black",
          }}
          className={`bottom-bubble-nav ${
            currentQuestionNumber === question_num ? "bubble-active" : ""
          } ${isAnswered(question_num) ? "bubble-answered" : ""}`}
        >
          <Text>{question_num.toString()}</Text>
        </Box>
      ))}
      <IconButton
        aria-label="next"
        icon={<ArrowRightIcon />}
        m={"0.3em"}
        isDisabled={maxIndex == wantedIndex}
        onClick={() => {
          setWantedIndex(wantedIndex + 1);
        }}
      />
      <IconButton
        aria-label="next question"
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
