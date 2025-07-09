import { Box, Center, Flex, Heading, Text, Textarea } from "@chakra-ui/react";
import { createRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@freecodecamp/ui";

import { Header } from "../components/header";
import { rootRoute } from "./root";

export function Test() {
  const runFocusRef = useRef(false);
  const [authorizationToken, setAuthorizationToken] = useState<string | null>(
    null
  );

  useEffect(() => {
    invoke<typeof authorizationToken>("get_authorization_token")
      .then((t) => setAuthorizationToken(t))
      .catch(console.error);
  }, []);

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

            <Button size="large" onClick={handleExamStart}>
              Start Exam
            </Button>
            <Button size="large" onClick={handleExamEnd}>
              End Exam
            </Button>
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
