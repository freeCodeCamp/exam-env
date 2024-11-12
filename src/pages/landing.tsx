import { Center, Flex, Text, Heading } from "@chakra-ui/react";
import { Button, Spacer } from "@freecodecamp/ui";
import { Header } from "../components/header";
import { Fragment, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Flash } from "../components/flash";
import { getExams } from "../utils/fetch";

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
  const loc = useLocation();
  const queryParams = new URLSearchParams(loc.search);
  const flashKind = queryParams.get("flashKind");
  const flashMessage = queryParams.get("flashMessage");

  const [exams, setExams] = useState<ExamInfo[] | null>(null);
  const [examError, setExamError] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchAvailableExams = async () => {
    try {
      const exams = await getExams();
      setExams(exams);
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
                      navigate(`/exam-landing/${exam.id}`);
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
