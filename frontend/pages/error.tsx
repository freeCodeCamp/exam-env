import { Box, Center, Code, Flex, Heading, Text } from "@chakra-ui/react";
import { createRoute } from "@tanstack/react-router";

import { rootRoute } from "./root";

type ErrorProps = {
  info?: string;
};

export function Error({ info }: ErrorProps) {
  const { errorInfo } = ErrorRoute.useSearch();

  return (
    <Box width={"full"}>
      <Center height={"100%"}>
        <Flex direction={"column"} alignItems={"center"}>
          <Heading size={"md"} alignSelf={"center"}>
            Unexpected Error
          </Heading>
          <Text align="center">
            An unexpected error has occurred. Please get in touch with
            freeCodeCamp support at support@freecodecamp.org.
          </Text>
          <Text align="center">
            Provide the following information in your email:
          </Text>
          <Code>{info || errorInfo}</Code>
        </Flex>
      </Center>
    </Box>
  );
}

export const ErrorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/error",
  component: Error,
});
