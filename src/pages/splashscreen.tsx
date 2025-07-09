import {
  check,
  DownloadEvent,
  DownloadOptions,
  Update,
} from "@tauri-apps/plugin-updater";
import { restartApp } from "../utils/commands";
import { ReactNode, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Center,
  Flex,
  ListIcon,
  ListItem,
  OrderedList,
  Progress,
  Text,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon, SpinnerIcon } from "@chakra-ui/icons";
import { Header } from "../components/header";
import { Button, Spacer } from "@freecodecamp/ui";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { rootRoute } from "./root";
import { LandingRoute } from "./landing";
import { delayForTesting } from "../utils/fetch";

function SplashParents({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <Center>
        <Flex direction="column">
          <Spacer size="m" />
          <OrderedList spacing={3}>{children}</OrderedList>
        </Flex>
      </Center>
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
  });

  const update = updateQuery.data;
  const downloadAndInstallQuery = useQuery({
    queryKey: ["downloadAndInstall", [update, isStartDownload]],
    enabled: !!update && isStartDownload,
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
        <ListItem fontWeight={900}>
          <ListIcon as={SpinnerIcon} color="blue.500" />
          Checking for app updates
        </ListItem>
        <Progress isIndeterminate />
        <ListItem opacity={0.5}>Downloading update</ListItem>
        <ListItem>Check device compatibility</ListItem>
      </SplashParents>
    );
  }

  if (updateQuery.isError) {
    return (
      <SplashParents>
        <ListItem fontWeight={900}>
          <ListIcon as={CloseIcon} color="red.500" />
          Failed to check for app updates
        </ListItem>
        <Text>{updateQuery.error.message}</Text>
        <ListItem>Downloading update</ListItem>
        <ListItem>Check device compatibility</ListItem>
      </SplashParents>
    );
  }

  if (!!update && !isStartDownload) {
    return (
      <SplashParents>
        <ListItem>
          <ListIcon as={CheckIcon} color="green.500" />
          App update found
        </ListItem>
        <ListItem fontWeight={900}>
          <ListIcon as={SpinnerIcon} color="blue.500" />
          Download update (version {update.version})?
        </ListItem>
        <Button block={true} onClick={() => setIsStartDownload(true)}>
          Download Now
        </Button>
        <ListItem>Check device compatibility</ListItem>
      </SplashParents>
    );
  }
  if (!!update && downloadAndInstallQuery.isPending) {
    return (
      <SplashParents>
        <ListItem>
          <ListIcon as={CheckIcon} color="green.500" />
          App update found
        </ListItem>
        <ListItem fontWeight={900}>
          <ListIcon as={SpinnerIcon} color="blue.500" />
          Downloading update (version {update.version}). App will restart when
          finished.
        </ListItem>
        <Progress hasStripe value={progress} />
        <ListItem>Check device compatibility</ListItem>
      </SplashParents>
    );
  }

  if (!!update && downloadAndInstallQuery.isError) {
    return (
      <SplashParents>
        <ListItem>
          <ListIcon as={CheckIcon} color="green.500" />
          Checking for app updates
        </ListItem>
        <ListItem fontWeight={900}>
          <ListIcon as={CloseIcon} color="red.500" />
          Downloading update
        </ListItem>
        <Text>{downloadAndInstallQuery.error.message}</Text>
        <ListItem>Check device compatibility</ListItem>
      </SplashParents>
    );
  }

  return (
    <SplashParents>
      <ListItem>
        <ListIcon as={CheckIcon} color="green.500" />
        App is up to date
      </ListItem>

      <ListItem>
        <ListIcon as={CheckIcon} color="green.500" />
        Device is compatible
      </ListItem>

      <Button
        block={true}
        onClick={() => navigate({ to: LandingRoute.to })}
        // disabled={!!compatibilityCheckQuery.error || update?.available}
        disabled={!!update}
      >
        Continue to Landing Page
      </Button>
    </SplashParents>
  );
}

// Check for updates
async function checkForUpdate() {
  if (import.meta.env.VITE_MOCK_DATA === "true") {
    await delayForTesting(1000);

    interface UpdateMetadata {
      rid: number;
      available: true;
      currentVersion: string;
      version: string;
      date?: string;
      body?: string;
      rawJson: Record<string, unknown>;
    }

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
      available: true,
      currentVersion: "0.0.1",
      version: "0.0.2",
      date: new Date().toUTCString(),
      body: "New update",
      rawJson: {},
    });
  }

  try {
    const update = await check();
    if (update) {
      console.debug(
        `Found update ${update.version} from ${update.date} with notes ${update.body}`
      );
      return update;
    }
  } catch (e) {
    throw new Error(e as string);
  }
  return null;
}

export const SplashscreenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Splashscreen,
});
