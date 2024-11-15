import { Button, Modal } from "@freecodecamp/ui";
import { Text } from "@chakra-ui/react";

interface IncompatibleDeviceModalProps {
  incompatibleDevice: string;
}

export const IncompatibleDeviceModal = ({
  incompatibleDevice,
}: IncompatibleDeviceModalProps) => {
  return (
    <Modal open={true} onClose={() => {}} variant="danger">
      <Modal.Header showCloseButton={false}>Incompatible</Modal.Header>
      <Modal.Body>
        Your device has lost compatibility. Restore compatibility, and reload
        the page to continue with your exam.
        <Text>{incompatibleDevice}</Text>
        <Button
          onClick={() => {
            window.location.reload();
          }}
        >
          Reload
        </Button>
      </Modal.Body>
    </Modal>
  );
};
