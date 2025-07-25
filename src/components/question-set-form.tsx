import { Box, Divider, Text } from "@chakra-ui/react";
import { QuizQuestion } from "@freecodecamp/ui";
import { useEffect } from "react";

import { Answers, FullQuestion, UserExamAttempt } from "../utils/types";
import { AudioPlayer } from "./audio-player";
import { parseMarkdown } from "../utils/markdown";
import { PrismFormatted } from "./prism-formatted";

type QuestionTypeFormProps = {
  fullQuestion: FullQuestion;
  newSelectedAnswers: Answers[number]["id"][];
  setNewSelectedAnswers: (newSelectedAnswers: Answers[number]["id"][]) => void;
  examAttempt: UserExamAttempt;
};

export function QuestionSetForm({
  fullQuestion,
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
    <Box width="65vw" paddingBottom={"1rem"}>
      {fullQuestion.questionSet.context && (
        <>
          <Text fontWeight={"bold"}>Context</Text>
          <PrismFormatted
            text={parseMarkdown(fullQuestion.questionSet.context)}
            getCodeBlockAriaLabel={(codeName) => `${codeName} code example`}
          />
          <Divider />
        </>
      )}
      {fullQuestion.audio && (
        <Box mb={"2em"} mt={"2em"}>
          <Text>Please listen to the following audio fragment:</Text>
          {/* NOTE: `fullQuestion` is passed to cause the whole component to rerender - correctly resetting the audio */}
          <AudioPlayer fullQuestion={fullQuestion} />
        </Box>
      )}
      <QuizQuestion
        question={
          <PrismFormatted
            text={parseMarkdown(fullQuestion.text)}
            getCodeBlockAriaLabel={(codeName) => `${codeName} code example`}
          />
        }
        selectedAnswer={newSelectedAnswers?.[0]}
        onChange={(newAnswer) => {
          // This is an array, because, in the future, checkboxes might be used.
          setNewSelectedAnswers([newAnswer]);
        }}
        answers={fullQuestion.answers.map((answer) => {
          return {
            label: (
              <PrismFormatted
                text={parseMarkdown(answer.text)}
                getCodeBlockAriaLabel={(codeName) => `${codeName} code example`}
              />
            ),
            value: answer.id,
          };
        })}
      />
    </Box>
  );
}
