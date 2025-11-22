import {
  Box,
  Center,
  Flex,
  Text,
  Heading,
  Checkbox,
  Code,
  Progress,
} from "@chakra-ui/react";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { Button, Spacer } from "@freecodecamp/ui";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { ProtectedRoute } from "../components/protected-route";
import { Header } from "../components/header";
import { rootRoute } from "./root";
import { ExamRoute } from "./exam";
import { checkForUpdate } from "../utils/fetch";
import { restartApp } from "../utils/commands";
import { captureException } from "@sentry/react";

export function ExamLanding() {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const { examId } = ExamLandingRoute.useParams();
  const { note } = ExamLandingRoute.useSearch();

  const updateMutation = useMutation({
    mutationKey: ["checkForUpdate"],
    mutationFn: checkForUpdate,
    retry: false,
  });

  const downloadAndInstallMutation = useMutation({
    mutationKey: ["downloadAndInstall", [updateMutation.data]],
    retry: false,
    mutationFn: async () => {
      let downloaded = 0;
      let contentLength: number | undefined = 0;

      await updateMutation.data!.downloadAndInstall((event) => {
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

  const startExamMutation = useMutation({
    mutationKey: ["startExam", examId],
    mutationFn: async () => {
      // Check for update, else navigate to the exam.
      const update = await checkForUpdate();
      if (update) {
        // Reload updateMutation state
        updateMutation.mutate();
        return;
      }
      navigate({ to: ExamRoute.to, params: { examId } });
    },
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

  return (
    <>
      <Header />
      <Box width={"full"}>
        <Center height={"100%"}>
          <Flex direction={"column"} maxWidth={"70%"}>
            <Spacer size="m" />
            <Heading>Instructions</Heading>
            <Spacer size="s" />
            <Text color={"red"}>
              Please note that any attempt to cheat will result in immediate
              disqualification from the exam and you will need to retake the
              exam to qualify for the certification.
            </Text>

            <Text>
              Once you have completed the attempt, within 7 days you will be
              able to check your results.
            </Text>
            <Text>
              If you run out of time, your attempt will be auto-submitted.
            </Text>
            {!!note && (
              <>
                <Heading size={"md"}>Exam Note</Heading>
                <Text>{note}</Text>
              </>
            )}
            <Checkbox onChange={(e) => setHasAgreed(e.target.checked)}>
              I agree to the terms and conditions
            </Checkbox>
            <Spacer size="s" />
            <Button
              // size="large"
              variant="primary"
              disabled={
                !hasAgreed ||
                updateMutation.isPending ||
                updateMutation.isError ||
                startExamMutation.isPending ||
                downloadAndInstallMutation.isPending ||
                downloadAndInstallMutation.isError
              }
              block={true}
              onClick={() => startExamMutation.mutate()}
            >
              {updateMutation.isPending || startExamMutation.isPending
                ? "Checking for updates..."
                : downloadAndInstallMutation.isPending
                  ? "Downloading update..."
                  : startExamMutation.isError
                    ? "Error Starting Exam. Retry."
                    : "Start Exam"}
            </Button>
            {updateMutation.data && !downloadAndInstallMutation.isPending && (
              <>
                <Text color="red.500" marginTop="4">
                  A new version of the application is available. You must update
                  before starting an exam.
                </Text>
                <Button
                  block={true}
                  onClick={() => downloadAndInstallMutation.mutate()}
                >
                  Download Now
                </Button>
              </>
            )}
            <Spacer size="m" />
            {updateMutation.isError && (
              <Box maxWidth="100%">
                <Text>Error checking for updates:</Text>
                <Code
                  p={2}
                  display="block"
                  width="100%"
                  maxWidth="100%"
                  overflowX="auto"
                  wordBreak="break-word"
                  whiteSpace="pre-wrap"
                >
                  {JSON.stringify(updateMutation.error.message, null, 2).slice(
                    0,
                    500
                  )}
                </Code>
                <Button onClick={() => updateMutation.mutate()}>Retry</Button>
              </Box>
            )}
            {downloadAndInstallMutation.isPending && !!updateMutation.data && (
              <Box>
                <Text>
                  Downloading update (version {updateMutation.data.version}).
                  App will restart when finished.
                </Text>
                <Progress hasStripe value={progress} />
              </Box>
            )}
            {downloadAndInstallMutation.isError && (
              <Box maxWidth="100%">
                <Text>Error downloading and installing update:</Text>
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
                    downloadAndInstallMutation.error.message,
                    null,
                    2
                  ).slice(0, 1000)}
                </Code>
                <Button onClick={() => downloadAndInstallMutation.mutate()}>
                  Retry
                </Button>
              </Box>
            )}
          </Flex>
        </Center>
      </Box>
    </>
  );
}

export const ExamLandingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/exam-landing/$examId",
  component: () => (
    <ProtectedRoute>
      <ExamLanding />
    </ProtectedRoute>
  ),
});
