import { extendTheme, type ThemeConfig, type StyleFunctionProps } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const config: ThemeConfig = {
  initialColorMode: "system",
  useSystemColorMode: false,
};

const fcc = {
  gray00: "#ffffff",
  gray05: "#f5f6f7",
  gray10: "#dfdfe2",
  gray15: "#d0d0d5",
  gray45: "#858591",
  gray75: "#3b3b4f",
  gray80: "#2a2a40",
  gray85: "#1b1b32",
  gray90: "#0a0a23",
  blueLight: "#99c9ff",
  blueMid: "#198eee",
  blueDark: "#002ead",
  greenLight: "#acd157",
  greenDark: "#00471b",
  yellowLight: "#ffc300",
  yellowDark: "#4d3800",
  redLight: "#ffadad",
  redDark: "#850000",
  purpleLight: "#dbb8ff",
  purpleDark: "#5a01a7",
};

export const theme = extendTheme({
  config,
  semanticTokens: {
    colors: {
      "fcc.bg": { default: fcc.gray00, _dark: fcc.gray90 },
      "fcc.bgSubtle": { default: fcc.gray05, _dark: fcc.gray85 },
      "fcc.bgElevated": { default: fcc.gray00, _dark: fcc.gray85 },
      "fcc.bgMuted": { default: fcc.gray10, _dark: fcc.gray80 },
      "fcc.fg": { default: fcc.gray90, _dark: fcc.gray00 },
      "fcc.fgMuted": { default: fcc.gray45, _dark: fcc.gray15 },
      "fcc.border": { default: fcc.gray10, _dark: fcc.gray75 },
      "fcc.borderStrong": { default: fcc.gray15, _dark: fcc.gray75 },
      "fcc.accent": { default: fcc.blueDark, _dark: fcc.blueLight },
      "fcc.accentBg": { default: fcc.blueLight, _dark: fcc.blueDark },
      "fcc.accentSolid": { default: fcc.blueMid, _dark: fcc.blueLight },
      "fcc.danger": { default: fcc.redDark, _dark: fcc.redLight },
      "fcc.dangerBg": { default: fcc.redLight, _dark: fcc.redDark },
      "fcc.success": { default: fcc.greenDark, _dark: fcc.greenLight },
      "fcc.warning": { default: fcc.yellowDark, _dark: fcc.yellowLight },
    },
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      "html, body": {
        bg: "fcc.bg",
        color: "fcc.fg",
      },
      "*::selection": {
        bg: mode(fcc.blueLight, fcc.blueDark)(props),
      },
    }),
  },
  components: {
    Card: {
      baseStyle: {
        container: {
          bg: "fcc.bgElevated",
          color: "fcc.fg",
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: "fcc.bgElevated",
          color: "fcc.fg",
        },
      },
    },
    Drawer: {
      baseStyle: {
        dialog: {
          bg: "fcc.bgElevated",
          color: "fcc.fg",
        },
      },
    },
    Divider: {
      baseStyle: {
        borderColor: "fcc.border",
        opacity: 1,
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderColor: "fcc.borderStrong",
            _placeholder: { color: "fcc.fgMuted" },
            _hover: { borderColor: "fcc.fgMuted" },
            _focusVisible: {
              borderColor: "fcc.accentSolid",
              boxShadow: "0 0 0 1px var(--chakra-colors-fcc-accentSolid)",
            },
          },
        },
      },
    },
  },
});
