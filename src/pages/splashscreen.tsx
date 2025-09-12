import {
  DownloadEvent,
  DownloadOptions,
  Update,
} from "@tauri-apps/plugin-updater";
import { restartApp } from "../utils/commands";
import { ReactNode, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { Header } from "../components/header";
import { Button, Spacer } from "@freecodecamp/ui";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { rootRoute } from "./root";
import { LandingRoute } from "./landing";
import { delayForTesting } from "../utils/fetch";
import { invoke } from "@tauri-apps/api/core";
import { VITE_MOCK_DATA } from "../utils/env";

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
  const [isStartDownload, setIsStartDownload] = useState(false);
  const navigate = useNavigate();

  const updateQuery = useQuery({
    queryKey: ["checkForUpdate"],
    queryFn: checkForUpdate,
    retry: false,
  });

  const update = updateQuery.data;
  const downloadAndInstallQuery = useQuery({
    queryKey: ["downloadAndInstall", [update, isStartDownload]],
    enabled: !!update && isStartDownload,
    retry: false,
    queryFn: async () => {
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
  });

  if (updateQuery.isPending) {
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

  if (updateQuery.isError) {
    return (
      <SplashParents>
        <ListItem fontWeight={900} display="flex" alignItems="center">
          <ListIcon as={CloseIcon} color="red.500" marginTop="2px" />
          Failed to check for app updates
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
              {JSON.stringify(updateQuery.error.message, null, 2)}
            </Code>
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

  if (!!update && !isStartDownload) {
    return (
      <SplashParents>
        <ListItem display="flex" alignItems="center">
          <ListIcon as={CheckIcon} color="green.500" marginTop="2px" />
          App update found
        </ListItem>
        <ListItem fontWeight={900} display="flex" alignItems="center">
          <ListIcon as={Spinner} color="blue.500" marginTop="2px" />
          Download update (version {update.version})?
        </ListItem>
        <Button block={true} onClick={() => setIsStartDownload(true)}>
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
          Downloading update
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
              {JSON.stringify(downloadAndInstallQuery.error.message, null, 2)}
            </Code>
          </Box>
        </ListItem>
        <ListItem display="flex" alignItems="center">
          <ListIcon marginTop="2px" />
          Check device compatibility
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

interface UpdateMetadata {
  rid: number;
  currentVersion: string;
  version: string;
  date?: string;
  body?: string;
  rawJson: Record<string, unknown>;
}

// Check for updates
async function checkForUpdate() {
  if (VITE_MOCK_DATA) {
    await delayForTesting(1000);

    class MockUpdate extends Update {
      constructor(metadata: UpdateMetadata) {
        super(metadata);
      }
      download(
        _onEvent?: (progress: DownloadEvent) => void,
        _options?: DownloadOptions
      ): Promise<void> {
        return new Promise((res) => res());
      }
      install(): Promise<void> {
        return new Promise((res) => res());
      }
      async downloadAndInstall(
        onEvent?: (progress: DownloadEvent) => void,
        _options?: DownloadOptions
      ): Promise<void> {
        if (onEvent) {
          onEvent({
            data: {
              contentLength: 100,
            },
            event: "Started",
          });
          for (let i = 0; i < 100; i++) {
            await delayForTesting(30);
            onEvent({
              data: {
                chunkLength: i,
              },
              event: "Progress",
            });
          }
          onEvent({
            event: "Finished",
          });
        }
      }
      close(): Promise<void> {
        return new Promise((res) => res());
      }
    }
    // Comment out to test update functionality
    return null;
    return new MockUpdate({
      rid: 0,
      currentVersion: "0.0.1",
      version: "0.0.2",
      date: new Date().toUTCString(),
      body: "New update",
      rawJson: {},
    });
  }

  try {
    const metadata = await invoke<UpdateMetadata>("check");
    if (metadata) {
      const update = new Update(metadata);
      console.debug(
        `Found update ${update.version} from ${update.date} with notes ${update.body}`
      );
      return update;
    }
  } catch (e) {
    console.error(e);
    // Error is already captured on the backend
    // captureException(e);
    throw new Error(JSON.stringify(e));
  }
  return null;
}

export const SplashscreenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Splashscreen,
});
