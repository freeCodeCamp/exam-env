import { UseMutationResult } from "@tanstack/react-query";
import { Box, Text, Spacer } from "@chakra-ui/react";
import { QuizQuestion } from "@freecodecamp/ui";
import Markdown from "markdown-to-jsx";
import { useEffect } from "react";

import { Answers, FullQuestion, UserExamAttempt } from "../utils/types";
import { ButtonLoading } from "./button-loading";
import { AudioPlayer } from "./audio-player";

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
  }, [fullQuestion]);

  return (
    <>
      {fullQuestion.questionSet.context && (
        <>
          <Text fontWeight={"bold"}>Context</Text>
          <Markdown>{fullQuestion.questionSet.context}</Markdown>
        </>
      )}
      {fullQuestion.audio && (
        <Box mb={"2em"} mt={"2em"}>
          <Text>Please listen to the following audio fragment:</Text>
          {/* NOTE: `fullQuestion` is passed to cause the whole component to rerender - correctly resetting the audio */}
          <AudioPlayer fullQuestion={fullQuestion} />
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
