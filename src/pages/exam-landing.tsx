import { Box, Center, Flex, Text, Heading, Checkbox } from "@chakra-ui/react";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@freecodecamp/ui";
import { useState } from "react";

import { ProtectedRoute } from "../components/protected-route";
import { Header } from "../components/header";
import { rootRoute } from "./root";
import { ExamRoute } from "./exam";

export function ExamLanding() {
  const [hasAgreed, setHasAgreed] = useState(false);
  const navigate = useNavigate();

  const { examId, note } = ExamLandingRoute.useParams();

  return (
    <>
      <Header />
      <Box width={"full"}>
        <Center height={"100%"}>
          <Flex direction={"column"} alignItems={"center"}>
            <Box
              display={"flex"}
              flexDirection={"column"}
              alignItems={"center"}
              width={"100vh"}
              mt={"1em"}
              p={"1em"}
            >
              {!!note && (
                <>
                  <Heading size={"md"} alignSelf={"center"}>
                    Exam Note
                  </Heading>
                  <Text align={"center"}>{note}</Text>
                </>
              )}
              <Heading size={"md"} alignSelf={"center"}>
                Instructions
              </Heading>
              <Text align={"center"} color={"tomato"}>
                Please note that any attempt to cheat will result in immediate
                disqualification from the exam and you will need to retake the
                exam to qualify for the certification.
              </Text>

              <Text align={"center"}>
                Once you have completed the attempt, within 7 days you will be
                able to check your results.
              </Text>
              <Checkbox onChange={(e) => setHasAgreed(e.target.checked)}>
                I agree to the terms and conditions
              </Checkbox>
              <Box pt={"2em"} width={"100%"}>
                <Button
                  size="large"
                  variant="primary"
                  disabled={!hasAgreed}
                  block={true}
                  onClick={() => {
                    navigate({ to: ExamRoute.to, params: { examId } });
                  }}
                >
                  Start Exam
                </Button>
              </Box>
            </Box>
          </Flex>
        </Center>
      </Box>
    </>
  );
}

export const ExamLandingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/exam-landing/$examId",
  component: () => (
    <ProtectedRoute>
      <ExamLanding />
    </ProtectedRoute>
  ),
});
