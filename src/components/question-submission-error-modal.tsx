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
import { useEffect, useState } from "react";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (submitQuestionMutation.isError) {
      setError(submitQuestionMutation.error.message);
    }
  }, [submitQuestionMutation.isError]);

  useEffect(() => {
    if (submitQuestionMutation.isSuccess) {
      setError(null);
    }
  }, [submitQuestionMutation.isSuccess]);

  function onClick() {
    submitQuestionMutation.mutate({
      fullQuestion,
      selectedAnswers: newSelectedAnswers,
    });
  }

  return (
    <Modal
      isOpen={!!error}
      onClose={onClick}
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
          {error}
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
