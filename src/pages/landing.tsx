import { createRoute, useNavigate } from "@tanstack/react-router";
import { Center, Flex, Text, Heading } from "@chakra-ui/react";
import { Fragment, useEffect, useState } from "react";
import { Button, Spacer } from "@freecodecamp/ui";

import { ProtectedRoute } from "../components/protected-route";
import { ExamLandingRoute } from "./exam-landing";
import { Header } from "../components/header";
import { Flash } from "../components/flash";
import { getExams } from "../utils/fetch";
import { rootRoute } from "./root";

interface ExamInfo {
  id: string;
  canTake: boolean;
  config: {
    name: string;
    note: string;
    totalTimeInMS: number;
  };
}

export function Landing() {
  const { flashKind, flashMessage } = LandingRoute.useSearch();

  const [exams, setExams] = useState<ExamInfo[] | null>(null);
  const [examError, setExamError] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchAvailableExams = async () => {
    try {
      const { data, error } = await getExams();
      if (error) {
        return setExamError(error.message);
      }

      setExams(data.exams);
      setExamError(null);
    } catch (e) {
      console.log(e);
      if (e instanceof Error) {
        setExamError(e.message);
      } else {
        setExamError("Something went wrong.");
      }
    }
  };

  useEffect(() => {
    fetchAvailableExams();
  }, []);

  return (
    <>
      <Flash {...{ flashKind, flashMessage }} />
      <Header />
      <Center>
        <Flex flexDirection={"column"}>
          <Spacer size="m" />
          <Heading>Welcome to the exam environment</Heading>
          {!examError && (
            <Text>
              Please select the exam you would like to take from the list below:
            </Text>
          )}
          {examError && (
            <>
              <Text textAlign={"center"} style={{ color: "red" }}>
                {examError}
              </Text>
              <Button
                variant={"danger"}
                onClick={() => {
                  fetchAvailableExams();
                }}
              >
                Reload List
              </Button>
            </>
          )}
          {exams &&
            exams.map((exam) => {
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
