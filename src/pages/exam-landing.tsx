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

  const { examId } = ExamLandingRoute.useParams();

  const checkDevice = async () => {
    // This is a workaround to make sure Tauri knows that the user has
    // granted permission to use the camera on MacOS.
    // https://github.com/tauri-apps/tauri/issues/2600#issuecomment-1970358866
    try {
      await navigator.mediaDevices.getUserMedia({
        video: true,
      });
    } catch (e) {
      console.log(e);
    }
    const enumberatedDevices = await navigator.mediaDevices.enumerateDevices();
    const devices = enumberatedDevices.flat();
    const cameraPermission = await navigator.permissions.query({
      // @ts-expect-error "camera" does exist on PermissionName. The type is wrong.
      name: "camera",
    });
    if (cameraPermission.state !== "granted") {
      return "Grant this app permission to use your camera";
    }
    const atLeastOneCamera = devices.some((d) => d.kind === "videoinput");
    if (!atLeastOneCamera) {
      return "No Camera found!";
    }
  };

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
              <Heading size={"md"} alignSelf={"center"}>
                Instructions
              </Heading>
              <Text align={"center"} color={"tomato"}>
                Please note that any attempt to cheat will result in immediate
                disqualification from the exam and you will need to retake the
                exam to qualify for the certification.
              </Text>

              <Text align={"center"}>
                During the exam, your screen and webcam will be monitored to
                ensure you are not cheating. Screen captures will be reviewed by
                staff, and deleted once the review is complete.
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
                    checkDevice().then((reason) => {
                      if (reason) {
                        alert(reason);
                      } else {
                        navigate({ to: ExamRoute.to, params: { examId } });
                      }
                    });
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
