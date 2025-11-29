import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
  ModalOverlay,
} from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-router";
import { openUrl } from "@tauri-apps/plugin-opener";
import { LandingRoute } from "../pages/landing";

interface ExamSubmissionModalProps {
  maxTimeReached: boolean;
  hasFinishedExam: boolean;
  setHasFinishedExam: (b: boolean) => void;
}

export function ExamSubmissionModal({
  maxTimeReached,
  hasFinishedExam,
  setHasFinishedExam,
}: ExamSubmissionModalProps) {
  const navigate = useNavigate();

  function onClose() {
    setHasFinishedExam(true);
    navigate({ to: LandingRoute.to });
  }

  return (
    <Modal isOpen={hasFinishedExam} onClose={onClose}>
      <ModalOverlay />
      <ModalContent role="dialog" aria-labelledby="exam-submission-title">
        <ModalHeader id="exam-submission-title">
          {maxTimeReached ? "Time's up!" : "Exam End"}
        </ModalHeader>
        <ModalBody>
          <Text>Thank you for taking the exam.</Text>
          <Text>
            Your exam attempt has been added to the moderation queue. Once
            moderated, you will be able to view your results on your{" "}
            <Button
              onClick={() => openUrl("https://freecodecamp.org/")}
              variant="link"
              colorScheme="blue"
              size="sm"
              textDecoration="underline"
              textUnderlineOffset="0.2em"
              textDecorationThickness="0.1em"
              textDecorationColor="blue.500"
              _hover={{
                textDecoration: "underline",
                textDecorationColor: "blue.300",
              }}
              aria-label="Open freeCodeCamp page in browser"
            >
              https://freecodecamp.org
            </Button>{" "}
            profile.
          </Text>
          <Text>
            You will still be able to make changes to this exam, whilst you have
            time left.
          </Text>
        </ModalBody>
        <ModalFooter justifyContent={"center"}>
          <Button onClick={onClose}>Close Exam</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
