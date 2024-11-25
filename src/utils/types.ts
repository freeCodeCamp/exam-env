import type * as Prisma from "@prisma/client";

export type UserExam = Omit<EnvExam, "questionSets" | "config" | "id"> & {
  config: Omit<EnvExam["config"], "tags" | "questionSets">;
  questionSets: (Omit<EnvQuestionSet, "questions"> & {
    questions: (Omit<
      EnvMultipleChoiceQuestion,
      "answers" | "tags" | "deprecated" | "submissionTimeInMS"
    > & {
      answers: Omit<EnvAnswer, "isCorrect">[];
    })[];
  })[];
} & { generatedExamId: string; examId: string };

export type FullQuestion = {
  questionSet: Omit<UserExam["questionSets"][number], "questions">;
} & UserExam["questionSets"][number]["questions"][number];

export type Answers =
  UserExam["questionSets"][number]["questions"][number]["answers"];

export type UserExamAttempt = Omit<
  EnvExamAttempt,
  "submissionTimeInMS" | "questionSets"
> & {
  questionSets: (Omit<EnvQuestionSetAttempt, "questions"> & {
    questions: Omit<EnvMultipleChoiceQuestionAttempt, "submissionTimeInMS">[];
  })[];
};

export type EnvExam = Prisma.EnvExam;
export type EnvAnswer = Prisma.EnvAnswer;
export type EnvMultipleChoiceQuestion = Prisma.EnvMultipleChoiceQuestion;
export const EnvQuestionType = {
  MultipleChoice: "MultipleChoice",
  Dialogue: "Dialogue",
} as const;
export type EnvQT = keyof typeof EnvQuestionType;
export type EnvQuestionSet = Prisma.EnvQuestionSet;
export type EnvConfig = Prisma.EnvConfig;
type EnvExamAttempt = Prisma.EnvExamAttempt;
export type EnvQuestionSetAttempt = Prisma.EnvQuestionSetAttempt;
export type EnvMultipleChoiceQuestionAttempt =
  Prisma.EnvMultipleChoiceQuestionAttempt;

export type UnrecoverableError = {
  source: String;
  message: String;
};
