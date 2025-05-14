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
import { openUrl } from "@tauri-apps/plugin-opener";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { Button, Spacer } from "@freecodecamp/ui";

import { useInvoke } from "../components/use-invoke";
import { AuthContext } from "../contexts/auth";
import { Header } from "../components/header";
import { rootRoute } from "./root";
import { LandingRoute } from "./landing";
import { useAuth0 } from "@auth0/auth0-react";
import { listen } from "@tauri-apps/api/event";
import { fetch } from "@tauri-apps/plugin-http";

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

  const { loginWithRedirect, user } = useAuth0();

  console.log(user);

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

  // 1. Generate code_challenge
  // 2. /authorize with code_challenge, code_challenge_method, audience
  //   - https://auth0.com/docs/api/authentication/authorization-code-flow-with-pkce/authorize-with-pkce
  // 3. /oauth/token with code_verifier, redirect_uri, client_id, code
  //   - https://auth0.com/docs/api/authentication/authorization-code-flow-with-pkce/get-token-pkce
  async function logIn() {
    // MRUGESH: This uses the auth0 react sdk which redirects in the app webview
    // - Not what we ideally want, but it works
    {
      // const a = await loginWithRedirect();
      // console.log("a", a);
      // return;
    }
    try {
      const client_id = import.meta.env.VITE_AUTH0_CLIENT_ID;
      const redirect_uri = import.meta.env.VITE_AUTH0_REDIRECT_URI;
      const scope = "openid profile email";
      const response_type = "code";
      const code_challenge_method = "S256";
      const code_verifier = createCodeVerifier();
      const code_challenge = await createCodeChallenge(code_verifier);

      console.log("code_challenge", code_challenge);
      console.log("code_verifier", code_verifier);

      // MRUGESH: This listen function is called by the app backend here:
      //          src-tauri/src/main.rsL55
      //          This 100% works. Just pay attention to the `code` passed through.
      // TODO: Docs are not clear on what this is. Docs say it is required, but auth0's sdks do not use it.
      // Copilot thinks it is:
      // const audience = "https://freecodecamp-dev.auth0.com/api/v2/";
      const unlisten = await listen<string>("auth0-redirect", async (event) => {
        const url = new URL(event.payload);
        const code = url.searchParams.get("code");

        console.log("code", code);
        const tokenUrl = new URL(
          "/oauth/token",
          import.meta.env.VITE_AUTH0_DOMAIN
        );

        tokenUrl.searchParams.set("client_id", client_id);
        tokenUrl.searchParams.set("redirect_uri", redirect_uri);
        tokenUrl.searchParams.set("grant_type", "authorization_code");
        tokenUrl.searchParams.set("code_verifier", code_verifier);
        // Safety: `code` is known to exist
        // TODO: On backend, check `code` exists
        tokenUrl.searchParams.set("code", code!);

        const response = await fetch(tokenUrl.toString(), {
          // Docs say this is a POST, but example uses GET
          method: "POST",
          headers: {
            // Example uses `application/x-www-form-urlencoded` :shrug:
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          console.error(response);
          throw new Error("Failed to get token");
        }

        const data = await response.json();

        console.log(data);
      });

      const authorizeUrl = new URL(
        "/authorize",
        import.meta.env.VITE_AUTH0_DOMAIN
      );
      authorizeUrl.searchParams.set("client_id", client_id);
      authorizeUrl.searchParams.set("redirect_uri", redirect_uri);
      // Not required, but auth0's sdk uses it
      authorizeUrl.searchParams.set("scope", scope);
      authorizeUrl.searchParams.set("response_type", response_type);
      authorizeUrl.searchParams.set("code_challenge", code_challenge);
      authorizeUrl.searchParams.set(
        "code_challenge_method",
        code_challenge_method
      );
      // MRUGESH: This opens the `authorizeUrl` in the OS's default `https` link handler
      await openUrl(authorizeUrl.toString());
    } catch (e) {
      setError(String(e));
    }
  }

  function createCodeVerifier() {
    const array = new Uint32Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, (dec) => ("0" + dec.toString(16)).slice(-2)).join(
      ""
    );
  }

  async function createCodeChallenge(codeVerifier: string) {
    const buffer = new TextEncoder().encode(codeVerifier);
    const hash = await window.crypto.subtle.digest("SHA-256", buffer);
    const base64String = btoa(String.fromCharCode(...new Uint8Array(hash)));
    return base64String
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
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
            <Button onClick={logIn}>LogIn</Button>
            {/* <FormControl isInvalid={!!error}>
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
            </FormControl> */}
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
