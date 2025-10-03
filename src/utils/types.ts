import type * as Prisma from "@prisma/client";

export type UserExam = Omit<
  ExamEnvironmentExam,
  "questionSets" | "config" | "id"
> & {
  config: Omit<ExamEnvironmentExam["config"], "tags" | "questionSets">;
  questionSets: (Omit<ExamEnvironmentQuestionSet, "questions"> & {
    questions: (Omit<
      ExamEnvironmentMultipleChoiceQuestion,
      | "answers"
      | "tags"
      | "deprecated"
      | "submissionTimeInMS"
      | "submissionTime"
    > & {
      answers: Omit<ExamEnvironmentAnswer, "isCorrect">[];
    })[];
  })[];
} & { generatedExamId: string; examId: string };

export type FullQuestion = {
  questionSet: Omit<UserExam["questionSets"][number], "questions">;
} & UserExam["questionSets"][number]["questions"][number];

export type Answers =
  UserExam["questionSets"][number]["questions"][number]["answers"];

export type UserExamAttempt = Omit<
  ExamEnvironmentExamAttempt,
  "submissionTimeInMS" | "questionSets" | "submissionTime"
> & {
  questionSets: (Omit<ExamEnvironmentQuestionSetAttempt, "questions"> & {
    questions: Omit<
      ExamEnvironmentMultipleChoiceQuestionAttempt,
      "submissionTimeInMS" | "submissionTime"
    >[];
  })[];
};

export type ExamEnvironmentExam = Prisma.ExamEnvironmentExam;
export type ExamEnvironmentAnswer = Prisma.ExamEnvironmentAnswer;
export type ExamEnvironmentMultipleChoiceQuestion =
  Prisma.ExamEnvironmentMultipleChoiceQuestion;
export const ExamEnvironmentQuestionType = {
  MultipleChoice: "MultipleChoice",
  Dialogue: "Dialogue",
} as const;
export type ExamEnvironmentQT = keyof typeof ExamEnvironmentQuestionType;
export type ExamEnvironmentQuestionSet = Prisma.ExamEnvironmentQuestionSet;
export type ExamEnvironmentConfig = Prisma.ExamEnvironmentConfig;
type ExamEnvironmentExamAttempt = Prisma.ExamEnvironmentExamAttempt;
export type ExamEnvironmentQuestionSetAttempt =
  Prisma.ExamEnvironmentQuestionSetAttempt;
export type ExamEnvironmentMultipleChoiceQuestionAttempt =
  Prisma.ExamEnvironmentMultipleChoiceQuestionAttempt;

export type UnrecoverableError = {
  source: String;
  message: String;
};
