import { Button, Modal } from "@freecodecamp/ui";
import { Answers, FullQuestion } from "../utils/types";

interface OfflineModalProps {
  isOffline: boolean;
  fullQuestion: FullQuestion;
  selectedAnswers: Answers[number]["id"][];
  submitQuestion: (
    fullQuestion: FullQuestion,
    selectedAnswers: Answers[number]["id"][]
  ) => void;
}

const OfflineModal = ({
  isOffline,
  fullQuestion,
  selectedAnswers,
  submitQuestion,
}: OfflineModalProps) => {
  return (
    <Modal open={isOffline} onClose={() => {}} variant="danger">
      <Modal.Header showCloseButton={false}>Offline</Modal.Header>
      <Modal.Body>
        You are currently offline. Please check your internet connection.
        <Button
          onClick={() => {
            submitQuestion(fullQuestion, selectedAnswers);
          }}
        >
          Retry
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default OfflineModal;
