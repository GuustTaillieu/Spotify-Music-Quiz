import { ComponentProps } from "react";

import { Button } from "@/features/shared/components/ui/button";
import { Link } from "@/features/shared/components/ui/link";

type Props = ComponentProps<typeof Button> & {};

export const LoginButton = ({ ...props }: Props) => {
  return (
    <Button variant="default" size="lg" {...props}>
      <Link to="/auth/login" asChild>
        Log in
      </Link>
    </Button>
  );
};
