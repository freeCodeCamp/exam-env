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
      <ModalContent>
        <ModalHeader backgroundColor={"#edb1af"}>
          Question Submission Error
        </ModalHeader>
        <ModalBody>{error}</ModalBody>
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
