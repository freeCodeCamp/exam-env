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
import { Answers, FullQuestion, UserExamAttempt } from "../utils/types";
import { getErrorMessage } from "../utils/errors";

interface QuestionSubmissionErrorModalProps {
  submitQuestionMutation: UseMutationResult<
    UserExamAttempt,
    Error,
    {
      fullQuestion: FullQuestion;
      selectedAnswers: Answers[number]["id"][];
    },
    unknown
  >;
  fullQuestion: FullQuestion;
  newSelectedAnswers: string[];
  questionSubmissionErrorModalIsOpen: boolean;
  questionSubmissionErrorModalOnClose: () => void;
}

export function QuestionSubmissionErrorModal({
  submitQuestionMutation,
  fullQuestion,
  newSelectedAnswers,
  questionSubmissionErrorModalIsOpen,
  questionSubmissionErrorModalOnClose,
}: QuestionSubmissionErrorModalProps) {
  function onClick() {
    submitQuestionMutation.mutate({
      fullQuestion,
      selectedAnswers: newSelectedAnswers,
    });
  }

  return (
    <Modal
      isOpen={questionSubmissionErrorModalIsOpen}
      onClose={questionSubmissionErrorModalOnClose}
      variant="danger"
      colorScheme="red"
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent
        role="alertdialog"
        aria-labelledby="error-modal-title"
        aria-describedby="error-modal-description"
      >
        <ModalHeader
          id="error-modal-title"
          backgroundColor={"#edb1af"}
          borderRadius={"md"}
        >
          Question Submission Error
        </ModalHeader>
        <ModalBody id="error-modal-description" role="alert">
          {submitQuestionMutation.isError &&
            getErrorMessage(submitQuestionMutation.error)}
        </ModalBody>
        <ModalFooter justifyContent={"center"}>
          <ButtonLoading
            onClick={onClick}
            isPending={submitQuestionMutation.isPending}
            loadingText={"Retrying Submission"}
          >
            Retry Question Submission
          </ButtonLoading>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
