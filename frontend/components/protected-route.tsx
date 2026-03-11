import { Navigate } from "@tanstack/react-router";
import { ReactNode, useContext } from "react";

import { AuthContext } from "../contexts/auth";
import { LoginRoute } from "../pages/login";
import { Center, Flex, Spinner } from "@chakra-ui/react";
import { Header } from "./header";
import { Spacer } from "@freecodecamp/ui";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  // Safety: Context should exist, because provider is mounted at root.
  const { token } = useContext(AuthContext)!;

  if (token.isFetching) {
    return (
      <>
        <Header />
        <Center as="main" id="main-content">
          <Flex flexDirection={"column"}>
            <Spacer size="m" />
            <Spinner size="xl" alignSelf={"center"} />
          </Flex>
        </Center>
      </>
    );
  }

  if (!token.data || token.isError) {
    // user cannot be authenticated
    console.debug("User cannot be authenticated. Navigating to login page.");
    return <Navigate to={LoginRoute.to} />;
  }
  return children;
};
