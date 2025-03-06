import { Spinner } from "@chakra-ui/react";
import { Button } from "@freecodecamp/ui";

interface ButtonLoadingProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
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
      block={true}
      onClick={onClick}
      disabled={isPending}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: isPending ? 0.5 : 1,
      }}
      {...rest}
      type="button"
    >
      {isPending && <Spinner marginInlineEnd="0.5rem" />}
      {children}
    </Button>
  );
}
