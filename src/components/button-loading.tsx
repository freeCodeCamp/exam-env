import { Spinner, Button, ButtonProps } from "@chakra-ui/react";
// import { Button } from "@freecodecamp/ui";

interface ButtonLoadingProps extends ButtonProps {
  children: React.ReactNode;
  isPending: boolean;
}

export function ButtonLoading({
  onClick,
  children,
  isPending,
  ...rest
}: ButtonLoadingProps) {
  return (
    <Button
      // block={true}
      onClick={onClick}
      disabled={isPending}
      // style={{
      //   display: "flex",
      //   justifyContent: "center",
      //   alignItems: "center",
      // }}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      {...rest}
      type="button"
    >
      {isPending && <Spinner marginInlineEnd="0.5rem" />}
      {children}
    </Button>
  );
}
