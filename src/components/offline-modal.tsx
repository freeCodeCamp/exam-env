import { Modal } from "@freecodecamp/ui";

import { Answers, FullQuestion } from "../utils/types";
import { UseMutationResult } from "@tanstack/react-query";
import { ButtonLoading } from "./button-loading";

interface OfflineModalProps {
  isOffline: boolean;
  fullQuestion: FullQuestion;
  selectedAnswers: Answers[number]["id"][];
  submitQuestionMutation: UseMutationResult<
    void,
    Error,
    {
      fullQuestion: FullQuestion;
      selectedAnswers: Answers[number]["id"][];
    }
  >;
}

const OfflineModal = ({
  isOffline,
  fullQuestion,
  selectedAnswers,
  submitQuestionMutation,
}: OfflineModalProps) => {
  return (
    <Modal open={isOffline} onClose={() => {}} variant="danger">
      <Modal.Header showCloseButton={false}>Offline</Modal.Header>
      <Modal.Body>
        You are currently offline. Please check your internet connection.
        <ButtonLoading
          onClick={() => {
            submitQuestionMutation.mutate({ fullQuestion, selectedAnswers });
          }}
          isPending={submitQuestionMutation.isPending}
        >
          Retry Question Submission
        </ButtonLoading>
      </Modal.Body>
    </Modal>
  );
};

export default OfflineModal;
