import { ComponentProps } from "react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { router } from "@/router";
import { PlusCircle } from "lucide-react";

type Props = ComponentProps<typeof Button> & {};

export const CreateQuizButton = ({ ...props }: Props) => {
  const currentUser = useCurrentUser();

  const handleClick = () => {
    if (!currentUser) {
      router.navigate({ to: "/auth/login" });
    }

    router.navigate({ to: "/quiz/create" });
  };

  return (
    <Button
      variant="default"
      size="lg"
      className={cn("text-md hover:no-underline", props.className)}
      onClick={handleClick}
      {...props}
    >
      <PlusCircle className="size-6" />
      Create a quiz
    </Button>
  );
};
