import { QuizQuestion } from "@freecodecamp/ui";
import { Box, Text, Spacer } from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import Markdown from "markdown-to-jsx";

import { Answers, FullQuestion, UserExamAttempt } from "../utils/types";
import { ButtonLoading } from "./button-loading";
import { UseMutationResult } from "@tanstack/react-query";

type QuestionTypeFormProps = {
  fullQuestion: FullQuestion;
  submitQuestionMutation: UseMutationResult<
    void,
    Error,
    {
      fullQuestion: FullQuestion;
      selectedAnswers: Answers[number]["id"][];
    }
  >;
  newSelectedAnswers: Answers[number]["id"][];
  setNewSelectedAnswers: (newSelectedAnswers: Answers[number]["id"][]) => void;
  maxTimeReached: boolean;
  examAttempt: UserExamAttempt;
};

export function QuestionSetForm({
  fullQuestion,
  submitQuestionMutation,
  maxTimeReached,
  newSelectedAnswers,
  setNewSelectedAnswers,
  examAttempt,
}: QuestionTypeFormProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioSource, setAudioSource] = useState("");
  const loadNextAudio = () => {
    if (audioRef.current) {
      // This is to prevent a stupid UI bug (all Shaun's fault)
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => {
          if (audioRef.current) {
            audioRef.current.pause();
          }
        })
        .catch(console.error);
    }
  };

  useEffect(() => {
    setNewSelectedAnswers(
      fullQuestion.answers
        .filter((a) =>
          examAttempt?.questionSets.some((qt) =>
            qt.questions.some((q) => q.answers.includes(a.id))
          )
        )
        .map((a) => a.id)
    );
    if (fullQuestion.audio) {
      setAudioSource(fullQuestion.audio.url);
    }
  }, [fullQuestion]);

  useEffect(loadNextAudio, [audioSource]);

  return (
    <>
      {fullQuestion.questionSet.context && (
        <>
          <Text fontWeight={"bold"}>Context</Text>
          <Markdown>{fullQuestion.questionSet.context}</Markdown>
        </>
      )}
      {fullQuestion.audio?.url && (
        <Box mb={"2em"} mt={"2em"}>
          <Text>Please listen to the following audio fragment:</Text>
          <audio
            controls
            controlsList="nodownload"
            ref={audioRef}
            src={audioSource}
          ></audio>
        </Box>
      )}
      <Text fontWeight={"bold"}>Question</Text>
      <QuizQuestion
        question={fullQuestion.text}
        selectedAnswer={newSelectedAnswers?.[0]}
        onChange={(newAnswer) => {
          // This is an array, because, in the future, checkboxes might be used.
          setNewSelectedAnswers([newAnswer]);
        }}
        answers={fullQuestion.answers.map((answer) => {
          return {
            label: answer.text,
            value: answer.id,
          };
        })}
      />
      <Spacer />
      <Box pt={"1em"}>
        <ButtonLoading
          onClick={() => {
            if (!newSelectedAnswers) {
              return;
            }

            submitQuestionMutation.mutate({
              fullQuestion,
              selectedAnswers: newSelectedAnswers,
            });
          }}
          disabled={
            !newSelectedAnswers.length ||
            maxTimeReached ||
            submitQuestionMutation.isPending
          }
          isPending={submitQuestionMutation.isPending}
        >
          Submit
        </ButtonLoading>
      </Box>
    </>
  );
}
