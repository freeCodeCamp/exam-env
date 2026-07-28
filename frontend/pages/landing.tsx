import { createRoute } from "@tanstack/react-router";
import { Center, Flex, Text, Heading, Spinner } from "@chakra-ui/react";
import { ReactNode } from "react";
import { Button, Spacer } from "@freecodecamp/ui";

import { ProtectedRoute } from "../components/protected-route";
import { Header } from "../components/header";
import { Flash } from "../components/flash";
import { getExams } from "../utils/fetch";
import { rootRoute } from "./root";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { ExamCard } from "../components/exam-card";
import { getErrorMessage } from "../utils/errors";
import { RepeatIcon } from "@chakra-ui/icons";

function LandingParent({
  examsQuery,
  children,
}: {
  examsQuery: UseQueryResult;
  children: ReactNode;
}) {
  const { flashKind, flashMessage } = LandingRoute.useSearch();

  return (
    <>
      <Flash {...{ flashKind, flashMessage }} />
      <Header />
      <Center as="main" id="main-content">
        <Flex flexDirection={"column"}>
          <Spacer size="m" />
          <Flex justifyContent={"space-between"}>
            <Heading as="h1" marginBottom={0}>
              Exam Selection
            </Heading>
            <Button
              size="medium"
              onClick={() => {
                examsQuery.refetch();
              }}
            >
              <RepeatIcon />
            </Button>
          </Flex>
          <Spacer size="m" />
          <Text>
            Please select the exam you would like to take from the list below.
          </Text>
          {children}
        </Flex>
      </Center>
    </>
  );
}

export function Landing() {
  const examsQuery = useQuery({
    queryKey: ["exams"],
    queryFn: getExams,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 500,
    gcTime: 10_000,
  });

  if (examsQuery.isPending || examsQuery.isFetching) {
    return (
      <LandingParent examsQuery={examsQuery}>
        <Spinner
          alignSelf={"center"}
          thickness="4px"
          speed="0.65s"
          emptyColor="fcc.bgMuted"
          color="fcc.accentSolid"
          size="xl"
        />
        <Spacer size="l" />
      </LandingParent>
    );
  }

  if (examsQuery.isError) {
    return (
      <LandingParent examsQuery={examsQuery}>
        <Text color="fcc.danger">{getErrorMessage(examsQuery.error)}</Text>
        <Button
          variant={"danger"}
          onClick={() => {
            examsQuery.refetch();
          }}
        >
          Reload List
        </Button>
      </LandingParent>
    );
  }

  // Exams sorted by `canTake` first, then by name alphabetically
  examsQuery.data.sort((a, b) => {
    if (a.canTake === b.canTake) {
      return a.config.name.localeCompare(b.config.name);
    }
    return a.canTake ? -1 : 1;
  });

  return (
    <LandingParent examsQuery={examsQuery}>
      <ul
        style={{ listStyleType: "none", padding: 0 }}
        aria-label="Available exams"
      >
        {examsQuery.data.map((exam) => {
          return <ExamCard key={exam.id} exam={exam} />;
        })}
      </ul>
    </LandingParent>
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
