import { Box, Divider, Text } from "@chakra-ui/react";
import { QuizQuestion } from "@freecodecamp/ui";
import { SyntheticEvent, useEffect, useRef } from "react";

import { Answers, FullQuestion, UserExamAttempt } from "../utils/types";
import { AudioPlayer } from "./audio-player";
import { parseMarkdown } from "../utils/markdown";
import { PrismFormatted } from "./prism-formatted";
import { captureEvent, createEvent, EventKind } from "../utils/superbase";

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
  const lastTrackedId = useRef<string | null>(null);

  function captionsToggled(e: SyntheticEvent<HTMLDetailsElement, Event>) {
    if (e.currentTarget.open) {
      captureEvent(
        createEvent(EventKind.CAPTIONS_OPENED, {
          attempt: examAttempt.id,
          question: fullQuestion.id,
        })
      );
    }
  }

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

    if (lastTrackedId.current !== fullQuestion.id) {
      captureEvent(
        createEvent(EventKind.QUESTION_VISIT, {
          attempt: examAttempt.id,
          question: fullQuestion.id,
        })
      );
      lastTrackedId.current = fullQuestion.id;
    }
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
      {!!fullQuestion.audio?.url && (
        <Box mb={"2em"} mt={"2em"}>
          <Text>Please listen to the following audio fragment:</Text>
          {/* NOTE: `fullQuestion` is passed to cause the whole component to rerender - correctly resetting the audio */}
          <AudioPlayer fullQuestion={fullQuestion} />
          {fullQuestion.audio.captions && (
            <details style={{ cursor: "pointer" }} onToggle={captionsToggled}>
              <summary>Show captions</summary>
              <Box marginTop="1em">
                <PrismFormatted
                  text={parseMarkdown(fullQuestion.audio.captions)}
                  getCodeBlockAriaLabel={(c) => `${c} code`}
                />
              </Box>
            </details>
          )}
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
