import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { ButtonLoading } from "./button-loading";
import { UseMutationResult } from "@tanstack/react-query";
import { Answers, FullQuestion } from "../utils/types";

interface QuestionSubmissionErrorModalProps {
  submitQuestionMutation: UseMutationResult<
    void,
    Error,
    {
      fullQuestion: FullQuestion;
      selectedAnswers: Answers[number]["id"][];
    },
    unknown
  >;
  fullQuestion: FullQuestion;
  newSelectedAnswers: string[];
}

export function QuestionSubmissionErrorModal({
  submitQuestionMutation,
  fullQuestion,
  newSelectedAnswers,
}: QuestionSubmissionErrorModalProps) {
  return (
    <Modal
      isOpen={submitQuestionMutation.isError}
      onClose={() => {}}
      variant="danger"
      colorScheme="red"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader backgroundColor={"#edb1af"}>
          Question Submission Error
        </ModalHeader>
        <ModalBody>
          {submitQuestionMutation?.error?.message || "Something went wrong"}
        </ModalBody>
        <ModalFooter justifyContent={"center"}>
          <ButtonLoading
            onClick={() => {
              submitQuestionMutation.mutate({
                fullQuestion,
                selectedAnswers: newSelectedAnswers,
              });
            }}
            isPending={submitQuestionMutation.isPending}
          >
            Retry Question Submission
          </ButtonLoading>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
