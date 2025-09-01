import { createRoute, useNavigate } from "@tanstack/react-router";
import { Center, Flex, Text, Heading, Spinner } from "@chakra-ui/react";
import { Fragment, ReactNode } from "react";
import { Button, Spacer } from "@freecodecamp/ui";

import { ProtectedRoute } from "../components/protected-route";
import { ExamLandingRoute } from "./exam-landing";
import { Header } from "../components/header";
import { Flash } from "../components/flash";
import { getExams } from "../utils/fetch";
import { rootRoute } from "./root";
import { useQuery } from "@tanstack/react-query";

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
  const navigate = useNavigate();

  const examsQuery = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const { data, error } = await getExams();
      if (error) {
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

  return (
    <LandingParent>
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
