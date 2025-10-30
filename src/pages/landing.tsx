import { createRoute } from "@tanstack/react-router";
import { Center, Flex, Text, Heading, Spinner } from "@chakra-ui/react";
import { ReactNode } from "react";
import { Button, Spacer } from "@freecodecamp/ui";

import { ProtectedRoute } from "../components/protected-route";
import { Header } from "../components/header";
import { Flash } from "../components/flash";
import { getExams } from "../utils/fetch";
import { rootRoute } from "./root";
import { useQuery } from "@tanstack/react-query";
import { captureException } from "@sentry/react";
import { ExamCard } from "../components/exam-card";

function LandingParent({ children }: { children: ReactNode }) {
  const { flashKind, flashMessage } = LandingRoute.useSearch();

  return (
    <>
      <Flash {...{ flashKind, flashMessage }} />
      <Header />
      <Center>
        <Flex flexDirection={"column"}>
          <Spacer size="m" />
          <Heading>Exam Selection</Heading>
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
    queryFn: async () => {
      const { data, error } = await getExams();
      if (error) {
        captureException(error);
        throw new Error(error.message);
      }
      return data;
    },
  });

  if (examsQuery.isPending) {
    return (
      <LandingParent>
        <Spinner
          alignSelf={"center"}
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="var(--dark-blue)"
          size="xl"
        />
      </LandingParent>
    );
  }

  if (examsQuery.isError) {
    return (
      <LandingParent>
        <Text style={{ color: "red" }}>{examsQuery.error.message}</Text>
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
    <LandingParent>
      <ul style={{ listStyleType: "none", padding: 0 }}>
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
