import { Box, Center, Flex, Text, Heading, Checkbox } from "@chakra-ui/react";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { Button, Spacer } from "@freecodecamp/ui";
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
          <Flex direction={"column"} maxWidth={"70%"}>
            <Spacer size="m" />
            {!!note && (
              <>
                <Heading size={"md"}>Exam Note</Heading>
                <Text>{note}</Text>
              </>
            )}
            <Heading>Instructions</Heading>
            <Spacer size="s" />
            <Text color={"red"}>
              Please note that any attempt to cheat will result in immediate
              disqualification from the exam and you will need to retake the
              exam to qualify for the certification.
            </Text>

            <Text>
              Once you have completed the attempt, within 7 days you will be
              able to check your results.
            </Text>
            <Text>
              If you run out of time, your attempt will be auto-submitted.
            </Text>
            <Checkbox onChange={(e) => setHasAgreed(e.target.checked)}>
              I agree to the terms and conditions
            </Checkbox>
            <Spacer size="s" />
            <Button
              // size="large"
              variant="primary"
              disabled={!hasAgreed}
              block={true}
              onClick={() => {
                navigate({ to: ExamRoute.to, params: { examId } });
              }}
            >
              Start Exam
            </Button>
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
