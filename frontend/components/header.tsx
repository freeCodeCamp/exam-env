import {
  useDisclosure,
  useColorMode,
  Box,
  Flex,
  Img,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Button,
} from "@chakra-ui/react";
import {
  ArrowForwardIcon,
  HamburgerIcon,
  MoonIcon,
  SunIcon,
} from "@chakra-ui/icons";
import { useNavigate } from "@tanstack/react-router";
import { useContext, useRef } from "react";

import { SplashscreenRoute } from "../pages/splashscreen";
import { LandingRoute } from "../pages/landing";
import { AuthContext } from "../contexts";

export function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const { token, logout } = useContext(AuthContext)!;
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const navigate = useNavigate();
  const isDark = colorMode === "dark";

  return (
    <>
      <Flex
        flexDirection="row"
        w={"100%"}
        alignItems={"start"}
        justifyContent={"space-between"}
        borderBottom="1px"
        borderBottomColor="fcc.border"
        display="flex"
      >
        <Box>
          <Flex h="20" mx="8px" width={"100%"}>
            <Box
              py="1rem"
              mx="20px"
              textAlign="center"
              fontWeight="700"
              fontSize="16px"
              display="flex"
              alignItems="center"
            >
              <Img
                src=" https://cdn.freecodecamp.org/platform/universal/fcc_puck_500.jpg"
                alt="freeCodeCamp logo"
                width="32px"
                height="32px"
                mr="12px"
                borderRadius="5px"
              />
              Exam Environment
            </Box>
          </Flex>
        </Box>
        <Flex alignSelf={"center"} width={"auto"} pr={"1em"} gap="2">
          <IconButton
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={isDark}
            onClick={toggleColorMode}
            icon={isDark ? <SunIcon /> : <MoonIcon />}
            variant="ghost"
          />
          <IconButton
            ref={btnRef}
            aria-label="Open navigation menu"
            aria-expanded={isOpen}
            onClick={onOpen}
            variant="ghost"
          >
            <HamburgerIcon />
          </IconButton>
        </Flex>
      </Flex>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent aria-label="Navigation menu">
          <DrawerCloseButton aria-label="Close navigation menu" />
          <DrawerHeader>Navigate</DrawerHeader>
          <DrawerBody>
            <Button
              onClick={() => navigate({ to: LandingRoute.to })}
              variant="ghost"
              w={"100%"}
              rightIcon={<ArrowForwardIcon />}
            >
              Home
            </Button>
            {import.meta.env.DEV && (
              <Button
                onClick={() => navigate({ to: SplashscreenRoute.to })}
                variant="ghost"
                w={"100%"}
                rightIcon={<ArrowForwardIcon />}
              >
                Splashscreen (Dev Only)
              </Button>
            )}
            {!!token.data && (
              <Button
                onClick={() => logout.mutate()}
                variant="ghost"
                w={"100%"}
                rightIcon={<ArrowForwardIcon />}
              >
                Logout
              </Button>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
