import { Quiz } from "@music-quiz/server/database/schema";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/button";

import { useQuizMutations } from "../hooks/useQuizMutations";

type QuizAttendButtonProps = {
  quizId: Quiz["id"];
  isAttending: boolean;
};

export const QuizAttendButton = ({
  quizId,
  isAttending,
}: QuizAttendButtonProps) => {
  const { currentUser } = useCurrentUser();

  const { attendMutation, unattendMutation } = useQuizMutations();

  if (!currentUser) return null;

  const handleClick = () => {
    if (isAttending) {
      unattendMutation.mutate({ id: quizId });
    } else {
      attendMutation.mutate({ id: quizId });
    }
  };

  return (
    <Button
      variant={isAttending ? "outline" : "default"}
      onClick={handleClick}
      disabled={attendMutation.isPending || unattendMutation.isPending}
    >
      {isAttending ? "Not Going" : "Going"}
    </Button>
  );
};
