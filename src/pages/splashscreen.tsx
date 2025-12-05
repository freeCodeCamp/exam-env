import { restartApp } from "../utils/commands";
import { ReactNode, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Box,
  Center,
  Code,
  Flex,
  Heading,
  ListIcon,
  ListItem,
  OrderedList,
  Progress,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon, InfoIcon } from "@chakra-ui/icons";
import { Button, Spacer } from "@freecodecamp/ui";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { captureException } from "@sentry/react";

import { Header } from "../components/header";
import { rootRoute } from "./root";
import { LandingRoute } from "./landing";
import { checkForUpdate, delayForTesting } from "../utils/fetch";
import { getErrorMessage } from "../utils/errors";

function SplashParents({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <Box width="full">
        <Center height="100%">
          <Flex direction="column" maxWidth="50%" minWidth={"450px"}>
            <Spacer size="m" />
            <Heading color="black">Environment Requirements</Heading>
            <Spacer size="s" />
            <OrderedList
              spacing={3}
              marginInlineStart={0}
              paddingInlineStart={0}
              listStyleType={"none"}
              overflowX="hidden"
            >
              {children}
            </OrderedList>
          </Flex>
        </Center>
      </Box>
    </>
  );
}

export function Splashscreen() {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const updateMutation = useMutation({
    mutationKey: ["checkForUpdate"],
    mutationFn: checkForUpdate,
    // Already captured on backend
    // onError: (error) => {
    //   captureException(error);
    // },
    retry: false,
  });

  useEffect(() => {
    if (updateMutation.isIdle) {
      // This is required to prevent double firing in StrictMode
      // https://github.com/TanStack/query/issues/5341
      const id = setTimeout(() => updateMutation.mutate(), 100);
      return () => clearTimeout(id);
    }
  }, []);

  const update = updateMutation.data;
  const downloadAndInstallQuery = useMutation({
    mutationKey: ["downloadAndInstall", [update]],
    retry: false,
    mutationFn: async () => {
      let downloaded = 0;
      let contentLength: number | undefined = 0;

      await update!.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength;
            console.debug(
              `Started downloading ${event.data.contentLength} bytes`
            );
            break;
          case "Progress":
            downloaded += event.data.chunkLength;
            const progress = (downloaded / contentLength!) * 100;
            setProgress(progress); // Update progress bar
            break;
          case "Finished":
            setProgress(100); // Set progress to 100% when done
            break;
        }
      });

      console.debug("Update installed");
      await restartApp();
    },
    onError: (error) => {
      captureException(error);
    },
  });

  const compatibilityCheckQuery = useQuery({
    queryKey: ["compatabilityCheck"],
    enabled: downloadAndInstallQuery.isSuccess || !update,
    queryFn: checkDeviceCompatibility,
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (updateMutation.isPending) {
    return (
      <SplashParents>
        <ListItem fontWeight={900} display="flex" alignItems="center">
          <ListIcon as={Spinner} color="blue.500" marginTop="2px" />
          Checking for app updates
        </ListItem>
        <Progress isIndeterminate />
        <ListItem opacity={0.5} display="flex" alignItems="center">
          <ListIcon marginTop="2px" />
          Downloading update
        </ListItem>
        <ListItem display="flex" alignItems="center">
          <ListIcon marginTop="2px" />
          Check device compatibility
        </ListItem>
      </SplashParents>
    );
  }

  if (updateMutation.isError) {
    return (
      <SplashParents>
        <ListItem fontWeight={900} display="flex" alignItems="center">
          <ListIcon as={CloseIcon} color="red.500" marginTop="2px" />
          Failed to check for app updates
        </ListItem>
        <ListItem pl={6} maxWidth="100%" overflowX="hidden">
          <Box maxWidth="100%">
            <Text color={"red"}>{getErrorMessage(updateMutation.error)}</Text>
            <Button onClick={() => updateMutation.mutate()}>Retry</Button>
          </Box>
        </ListItem>
        <ListItem display="flex" alignItems="center">
          <ListIcon marginTop="2px" />
          Downloading update
        </ListItem>
        <ListItem display="flex" alignItems="center">
          <ListIcon marginTop="2px" />
          Check device compatibility
        </ListItem>
      </SplashParents>
    );
  }

  if (!!update && !downloadAndInstallQuery.isPending) {
    return (
      <SplashParents>
        <ListItem display="flex" alignItems="center">
          <ListIcon as={CheckIcon} color="green.500" marginTop="2px" />
          App update found
        </ListItem>
        <ListItem fontWeight={900} display="flex" alignItems="center">
          <ListIcon as={InfoIcon} color="blue.500" marginTop="2px" />
          Download update (version {update.version})?
        </ListItem>
        <Button block={true} onClick={() => downloadAndInstallQuery.mutate()}>
          Download Now
        </Button>
        <ListItem display="flex" alignItems="center">
          <ListIcon marginTop="2px" />
          Check device compatibility
        </ListItem>
      </SplashParents>
    );
  }
  if (!!update && downloadAndInstallQuery.isPending) {
    return (
      <SplashParents>
        <ListItem display="flex" alignItems="center">
          <ListIcon as={CheckIcon} color="green.500" marginTop="2px" />
          App update found
        </ListItem>
        <ListItem fontWeight={900} display="flex" alignItems="center">
          <ListIcon as={Spinner} color="blue.500" marginTop="2px" />
          Downloading update (version {update.version}). App will restart when
          finished.
        </ListItem>
        <Progress hasStripe value={progress} />
        <ListItem display="flex" alignItems="center">
          <ListIcon marginTop="2px" />
          Check device compatibility
        </ListItem>
      </SplashParents>
    );
  }

  if (!!update && downloadAndInstallQuery.isError) {
    return (
      <SplashParents>
        <ListItem display="flex" alignItems="center">
          <ListIcon as={CheckIcon} color="green.500" marginTop="2px" />
          Checking for app updates
        </ListItem>
        <ListItem fontWeight={900} display="flex" alignItems="center">
          <ListIcon as={CloseIcon} color="red.500" marginTop="2px" />
          Download error
        </ListItem>
        <ListItem pl={6} maxWidth="100%" overflowX="hidden">
          <Box maxWidth="100%">
            <Code
              p={2}
              display="block"
              width="100%"
              maxWidth="100%"
              overflowX="auto"
              wordBreak="break-word"
              whiteSpace="pre-wrap"
            >
              {JSON.stringify(
                downloadAndInstallQuery.error.message,
                null,
                2
              ).slice(0, 1000)}
            </Code>
            <Button onClick={() => downloadAndInstallQuery.mutate()}>
              Retry
            </Button>
          </Box>
        </ListItem>
        <ListItem display="flex" alignItems="center">
          <ListIcon marginTop="2px" />
          Check device compatibility
        </ListItem>
      </SplashParents>
    );
  }

  if (compatibilityCheckQuery.isPending) {
    return (
      <SplashParents>
        <ListItem>
          <ListIcon as={CheckIcon} color="green.500" />
          App is up to date
        </ListItem>
        <ListItem fontWeight={900}>
          <ListIcon as={Spinner} color="blue.500" marginTop="2px" />
          Checking device compatibility
        </ListItem>
        <Progress isIndeterminate />
      </SplashParents>
    );
  }

  if (compatibilityCheckQuery.isError) {
    return (
      <SplashParents>
        <ListItem>
          <ListIcon as={CheckIcon} color="green.500" />
          App is up to date
        </ListItem>
        <ListItem fontWeight={900}>
          <ListIcon as={CloseIcon} color="red.500" />
          Error checking device compatibility
        </ListItem>
        <ListItem pl={6} maxWidth="100%" overflowX="hidden">
          <Box maxWidth="100%">
            <Code
              p={2}
              display="block"
              width="100%"
              maxWidth="100%"
              overflowX="auto"
              wordBreak="break-word"
              whiteSpace="pre-wrap"
            >
              {getErrorMessage(compatibilityCheckQuery.error)}
            </Code>
            <Button
              onClick={() => {
                compatibilityCheckQuery.refetch();
              }}
            >
              Retry
            </Button>
          </Box>
        </ListItem>
      </SplashParents>
    );
  }

  return (
    <SplashParents>
      <ListItem display="flex" alignItems="center">
        <ListIcon as={CheckIcon} color="green.500" marginTop="2px" />
        App is up to date
      </ListItem>

      <ListItem display="flex" alignItems="center">
        <ListIcon as={CheckIcon} color="green.500" marginTop="2px" />
        Device is compatible
      </ListItem>

      <Spacer size="s" />

      <Button
        block={true}
        onClick={() => navigate({ to: LandingRoute.to })}
        // disabled={!!compatibilityCheckQuery.error || update?.available}
        disabled={!!update}
      >
        Select Exam
      </Button>
    </SplashParents>
  );
}

async function checkDeviceCompatibility() {
  if (import.meta.env.VITE_MOCK_DATA === "true") {
    await delayForTesting(1000);
  }
  const compatError = await updateDeviceList();
  if (compatError) {
    captureException(compatError);
    throw compatError;
  }
  return null;
}

async function updateDeviceList() {
  let audioCtx: AudioContext | null = null;

  try {
    // Vendor prefix safety (mostly for older Safari/WebKit, but good for safety)
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;

    if (!AudioContext) {
      throw new Error("Web Audio API is not supported by this system.");
    }

    audioCtx = new AudioContext();

    // Check for immediate failure states
    // 'closed': The context has been closed or hardware is completely missing.
    if (audioCtx.state === "closed") {
      throw new Error("Audio system reported 'closed' state.");
    }

    // Note: No check for 'suspended' here because strict autoplay policies
    // (especially on macOS) often start contexts in 'suspended' until the user clicks something.
    // However, the fact that the object was successfully created proves the drivers are there.

    return null;
  } catch (e) {
    return new Error(
      `Audio system check failed. Please ensure your device has a working sound card/drivers. ${String(e)}`
    );
  } finally {
    // Clean up to prevent memory leaks
    if (audioCtx) {
      try {
        await audioCtx.close();
      } catch (e) {}
    }
  }
}

export const SplashscreenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Splashscreen,
});
