import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useDisclosure,
  CloseButton,
  Box,
  Flex,
} from "@chakra-ui/react";

export type FlashProps = {
  flashKind: string | null;
  flashMessage: string | null;
};

export function Flash({ flashKind = "info", flashMessage }: FlashProps) {
  if (!flashMessage) {
    return null;
  }

  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });

  flashKindToStatus(flashKind);

  return (
    isOpen && (
      <Flex alignContent={"center"}>
        <Alert status={flashKind} justifyContent={"space-between"}>
          <AlertIcon />
          <Box>
            <AlertTitle>{FLASH_TITLES[flashKind]}</AlertTitle>
            <AlertDescription>{flashMessage}</AlertDescription>
          </Box>
          <CloseButton
            position="relative"
            right={-1}
            top={-1}
            onClick={onClose}
          />
        </Alert>
      </Flex>
    )
  );
}

const handledFlashKinds = ["error", "info", "warning"] as const;

// The kind names the alert's styling, not what happened - "warning" on its own
// tells the user nothing.
const FLASH_TITLES: Record<(typeof handledFlashKinds)[number], string> = {
  error: "Something went wrong",
  info: "Notice",
  warning: "Warning",
};

function flashKindToStatus(
  flashKind: string | null
): asserts flashKind is (typeof handledFlashKinds)[number] {
  // @ts-expect-error What a stupid type error
  if (!handledFlashKinds.includes(flashKind)) {
    throw new Error("Unreachable. Unhandled FlashKind");
  }
}
