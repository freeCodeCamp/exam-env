import { Spinner, Button, ButtonProps } from "@chakra-ui/react";

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
      onClick={onClick}
      disabled={isPending}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      {...rest}
      type="button"
      aria-busy={isPending}
    >
      {isPending && <Spinner marginInlineEnd="0.5rem" aria-hidden="true" />}
      {children}
    </Button>
  );
}
