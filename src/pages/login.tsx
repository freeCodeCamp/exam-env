import {
  Box,
  Center,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Button as ChakraButton,
} from "@chakra-ui/react";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { Button, Spacer } from "@freecodecamp/ui";
import { openUrl } from "@tauri-apps/plugin-opener";

import { useInvoke } from "../components/use-invoke";
import { AuthContext } from "../contexts/auth";
import { Header } from "../components/header";
import { rootRoute } from "./root";
import { LandingRoute } from "./landing";
import { LEARN_BASE } from "../utils/env";
import { captureException } from "@sentry/react";

export function Login() {
  const navigate = useNavigate();
  const { login, examEnvironmentAuthenticationToken } =
    useContext(AuthContext)!;
  const [accountToken, setAccountToken] = useState(
    examEnvironmentAuthenticationToken || ""
  );
  const [error, setError] = useState<string | null>(null);
  const [setAuthToken, isPending, setAuthTokenError] = useInvoke<undefined>(
    "set_authorization_token"
  );

  useEffect(() => {
    if (setAuthTokenError) {
      captureException(setAuthTokenError);
    }
    setError(JSON.stringify(setAuthTokenError));
  }, [setAuthTokenError]);

  useEffect(() => {
    if (examEnvironmentAuthenticationToken) {
      navigate({ to: LandingRoute.to });
    }
  }, [examEnvironmentAuthenticationToken]);

  function handleTokenChange(e: ChangeEvent<HTMLInputElement>) {
    setAccountToken(e.target.value);
  }

  async function connectAuthToken(token: string) {
    await setAuthToken({
      newAuthorizationToken: token,
    });
    try {
      await login(token);
      navigate({ to: LandingRoute.to });
    } catch (e) {
      setError(JSON.stringify(e));
    }
  }

  async function openPage(page: string) {
    await openUrl(page);
  }

  return (
    <>
      <Header />
      <Box width="full">
        <Center height="100%">
          <Flex direction="column">
            <Spacer size="m" />
            <Heading color="black">Log In</Heading>
            <Spacer size="s" />
            <FormControl isInvalid={!!error}>
              <FormLabel>
                {" "}
                Connect your freeCodeCamp.org account by inputing your account
                token:
              </FormLabel>
              <Input
                type="text"
                placeholder="Account Token..."
                onChange={handleTokenChange}
                value={accountToken}
                disabled={isPending}
              />
              {!!error && <FormErrorMessage>{error}</FormErrorMessage>}
              <FormHelperText>
                Go to{" "}
                <ChakraButton
                  onClick={() =>
                    openPage(new URL("/settings", LEARN_BASE).href)
                  }
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
                >
                  {new URL("/settings", LEARN_BASE).href}
                </ChakraButton>{" "}
                to generate a token if you do not already have one.
              </FormHelperText>
              <Spacer size="m" />
              <Button
                type="submit"
                onClick={() => connectAuthToken(accountToken)}
                disabled={isPending || accountToken.length === 0}
                block={true}
              >
                Connect
              </Button>
            </FormControl>
            <Spacer size="m" />
            <details>
              <summary>How do I generate a token?</summary>
              <Spacer size="s" />
              <ul>
                <li>
                  1. Go To{" "}
                  <ChakraButton
                    onClick={() =>
                      openPage(
                        new URL(
                          "/settings#exam-environment-authorization-token",
                          LEARN_BASE
                        ).href
                      )
                    }
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
                  >
                    The freeCodeCamp settings page.
                  </ChakraButton>{" "}
                </li>
                <li>2. Press "Generate Exam Token."</li>
                <li>3. Copy the token and paste it into the input field.</li>
              </ul>
            </details>
          </Flex>
        </Center>
      </Box>
    </>
  );
}

export const LoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});
