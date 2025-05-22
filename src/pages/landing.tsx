import { createRoute, useNavigate } from "@tanstack/react-router";
import { Center, Flex, Text, Heading, Spinner } from "@chakra-ui/react";
import { Fragment } from "react";
import { Button, Spacer } from "@freecodecamp/ui";

import { ProtectedRoute } from "../components/protected-route";
import { ExamLandingRoute } from "./exam-landing";
import { Header } from "../components/header";
import { Flash } from "../components/flash";
import { getExams } from "../utils/fetch";
import { rootRoute } from "./root";
import { useQuery } from "@tanstack/react-query";

export function Landing() {
  const { flashKind, flashMessage } = LandingRoute.useSearch();

  const navigate = useNavigate();

  const examsQuery = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const { data, error } = await getExams();
      if (error) {
        throw new Error(error.message);
      }
      return data.exams;
    },
  });

  if (examsQuery.isPending) {
    return (
      <>
        <Flash {...{ flashKind, flashMessage }} />
        <Header />
        <Center>
          <Flex flexDirection={"column"}>
            <Spacer size="m" />
            <Heading>Welcome to the exam environment</Heading>
            <Spinner
              alignSelf={"center"}
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="var(--dark-blue)"
              size="xl"
            />
          </Flex>
        </Center>
      </>
    );
  }

  if (examsQuery.isError) {
    return (
      <>
        <Flash {...{ flashKind, flashMessage }} />
        <Header />
        <Center>
          <Flex flexDirection={"column"}>
            <Spacer size="m" />
            <Heading>Welcome to the exam environment</Heading>
            <Text textAlign={"center"} style={{ color: "red" }}>
              {examsQuery.error.message}
            </Text>
            <Button
              variant={"danger"}
              onClick={() => {
                examsQuery.refetch();
              }}
            >
              Reload List
            </Button>
          </Flex>
        </Center>
      </>
    );
  }

  return (
    <>
      <Flash {...{ flashKind, flashMessage }} />
      <Header />
      <Center>
        <Flex flexDirection={"column"}>
          <Spacer size="m" />
          <Heading>Welcome to the exam environment</Heading>
          <Text textAlign={"center"}>
            Please select the exam you would like to take from the list below.
          </Text>
          {examsQuery.data.map((exam) => {
            return (
              <Fragment key={exam.id}>
                <Button
                  disabled={!exam.canTake}
                  onClick={() => {
                    navigate({
                      to: ExamLandingRoute.to,
                      params: { examId: exam.id, note: exam.config.note },
                    });
                  }}
                >
                  {exam.config.name}
                </Button>
                <Spacer size="s" />
              </Fragment>
            );
          })}
        </Flex>
      </Center>
    </>
  );
}

export const LandingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/landing",
  component: () => (
    <ProtectedRoute>
      <Landing />
    </ProtectedRoute>
  ),
});
