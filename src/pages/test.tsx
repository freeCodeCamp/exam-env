import { Box, Center, Flex, Heading, Text, Textarea } from "@chakra-ui/react";
import { createRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@freecodecamp/ui";

import { useAppFocus } from "../components/use-app-focus";
import { takeScreenshot } from "../utils/commands";
import { Camera } from "../components/camera";
import { Header } from "../components/header";
import { rootRoute } from "./root";

export function Test() {
  const runFocusRef = useRef(false);
  const [authorizationToken, setAuthorizationToken] = useState<string | null>(
    null
  );

  function onFocusChanged(focused: boolean) {
    if (runFocusRef.current) {
      console.log(`App ${focused ? "is" : "is not"} focused`);
    }
  }

  useEffect(() => {
    invoke<typeof authorizationToken>("get_authorization_token")
      .then((t) => setAuthorizationToken(t))
      .catch(console.error);
  }, []);

  useAppFocus({
    onFocusChanged,
  });

  async function handleAuthorizationToken() {
    await invoke("set_authorization_token", {
      newAuthorizationToken: authorizationToken ?? "",
    });
  }

  function handleExamStart() {
    runFocusRef.current = true;
  }

  function handleExamEnd() {
    runFocusRef.current = false;
  }

  function onUserMediaSetupError(err: unknown) {
    console.log("TODO: ", err);
  }

  return (
    <Flex direction="column">
      <Header />
      <Box width="full">
        <Center height="100%">
          <Flex direction="column" alignItems="center">
            <Heading as="h2">Test Page</Heading>

            <Textarea
              value={authorizationToken ?? ""}
              onChange={(e) => setAuthorizationToken(e.target.value)}
              width="75%"
            />
            <Text width="75%">
              Current Authorization Token: {authorizationToken ?? ""}
            </Text>
            <Button size="large" onClick={() => handleAuthorizationToken()}>
              Set Authorization Token
            </Button>

            <Button size="large" onClick={() => takeScreenshot()}>
              Capture Screen
            </Button>
            <Button size="large" onClick={handleExamStart}>
              Start Exam
            </Button>
            <Button size="large" onClick={handleExamEnd}>
              End Exam
            </Button>
            <Camera autoPlay onUserMediaSetupError={onUserMediaSetupError} />
          </Flex>
        </Center>
      </Box>
    </Flex>
  );
}

export const TestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/test",
  // TODO: Lazy load
  component: import.meta.env.DEV ? Test : () => null,
});
