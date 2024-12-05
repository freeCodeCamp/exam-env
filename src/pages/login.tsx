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
} from "@chakra-ui/react";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { Button, Spacer } from "@freecodecamp/ui";

import { useInvoke } from "../components/use-invoke";
import { AuthContext } from "../contexts/auth";
import { Header } from "../components/header";
import { rootRoute } from "./root";
import { LandingRoute } from "./landing";

export function Login() {
  const navigate = useNavigate();
  const { login, examEnvironmentAuthenticationToken } =
    useContext(AuthContext)!;
  const [accountToken, setAccountToken] = useState(
    examEnvironmentAuthenticationToken || ""
  );
  const [error, setError] = useState<unknown>(null);
  const [setAuthToken, isPending, setAuthTokenError] = useInvoke<undefined>(
    "set_authorization_token"
  );

  useEffect(() => {
    setError(setAuthTokenError);
  }, [setAuthTokenError]);

  useEffect(() => {
    if (examEnvironmentAuthenticationToken) {
      navigate({ to: LandingRoute.to });
    }
  }, [examEnvironmentAuthenticationToken]);

  function handleTokenChange(e: ChangeEvent<HTMLInputElement>) {
    setAccountToken(e.target.value);
  }

  async function connectAuthToken() {
    await setAuthToken({
      newAuthorizationToken: accountToken,
    });
    try {
      await login(accountToken);
      navigate({ to: LandingRoute.to });
    } catch (e) {
      setError(String(e));
    }
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
              />
              {!!error && (
                <FormErrorMessage>{JSON.stringify(error)}</FormErrorMessage>
              )}
              <FormHelperText>
                Go to https://freecodecamp.org/settings to generate a token if
                you do not already have one.
              </FormHelperText>
              <Spacer size="m" />
              <Button
                type="submit"
                onClick={() => connectAuthToken()}
                disabled={isPending}
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
                  <a
                    href="https://freecodecamp.org/settings#exam-environment-authorization-token"
                    style={{ textDecoration: "underline" }}
                    target="_blank"
                  >
                    The freeCodeCamp settings page.
                  </a>{" "}
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
