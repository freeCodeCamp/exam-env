import { Box, Center, Flex, Heading, Text } from "@chakra-ui/react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useContext, useEffect, useState } from "react";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { Button, Spacer } from "@freecodecamp/ui";

import { useInvoke } from "../components/use-invoke";
import { AuthContext } from "../contexts/auth";
import { Header } from "../components/header";
import { rootRoute } from "./root";
import { LandingRoute } from "./landing";
import { listen } from "@tauri-apps/api/event";
import { fetch } from "@tauri-apps/plugin-http";

export function Login() {
  const navigate = useNavigate();
  const { login, accessToken } = useContext(AuthContext)!;
  const [error, setError] = useState<unknown>(null);
  const [setAuthToken, isPending, setAuthTokenError] = useInvoke<undefined>(
    "set_authorization_token"
  );

  useEffect(() => {
    setError(setAuthTokenError);
  }, [setAuthTokenError]);

  useEffect(() => {
    if (accessToken) {
      navigate({ to: LandingRoute.to });
    }
  }, [accessToken]);

  // 1. Generate code_challenge
  // 2. /authorize with code_challenge, code_challenge_method, audience
  //   - https://auth0.com/docs/api/authentication/authorization-code-flow-with-pkce/authorize-with-pkce
  // 3. /oauth/token with code_verifier, redirect_uri, client_id, code
  //   - https://auth0.com/docs/api/authentication/authorization-code-flow-with-pkce/get-token-pkce
  async function logIn() {
    try {
      const client_id = import.meta.env.VITE_AUTH0_CLIENT_ID;
      const redirect_uri = import.meta.env.VITE_AUTH0_REDIRECT_URI;
      const scope = "openid profile email";
      const response_type = "code";
      const code_challenge_method = "S256";
      const code_verifier = createCodeVerifier();
      const code_challenge = await createCodeChallenge(code_verifier);

      const unlisten = await listen<string>("auth0-redirect", async (event) => {
        const url = new URL(event.payload);
        const code = url.searchParams.get("code");

        const tokenUrl = new URL(
          "/oauth/token",
          import.meta.env.VITE_AUTH0_DOMAIN
        );

        const response = await fetch(tokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: new URLSearchParams({
            client_id,
            redirect_uri,
            grant_type: "authorization_code",
            code_verifier,
            // Safety: `code` is known to exist
            // TODO: On backend, check `code` exists
            code: code!,
          }),
        });

        unlisten();
        if (!response.ok) {
          console.error(response);
          console.log(await response.json());
          throw new Error("Failed to get token");
        }

        const data = await response.json();

        const accessToken = data.access_token;

        await setAuthToken({
          newAuthToken: accessToken,
        });
        try {
          await login(accessToken);
          navigate({ to: LandingRoute.to });
        } catch (e) {
          setError(String(e));
        }
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
      await openUrl(authorizeUrl.toString());
    } catch (e) {
      setError(String(e));
    }
  }

  function createCodeVerifier() {
    const array = new Uint32Array(32);
    window.crypto.getRandomValues(array);
    // The octet sequence is then base64url-encoded to produce a
    // 43-octet URL safe string to use as the code verifier.
    const base64String = btoa(String.fromCharCode(...new Uint8Array(array)));
    return base64String
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }

  /**
   * code_challenge = BASE64URL-ENCODE(SHA256(ASCII(code_verifier)))
   */
  async function createCodeChallenge(codeVerifier: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    const base64String = btoa(String.fromCharCode(...new Uint8Array(digest)));
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
            <Button onClick={logIn} disabled={isPending}>
              Log In
            </Button>
            {!!error && <Text>{JSON.stringify(error)}</Text>}
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
