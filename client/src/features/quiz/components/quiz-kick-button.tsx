import { LocalUser, Quiz } from "@music-quiz/server/database/schema";
import { useState } from "react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/features/shared/components/ui/dialog";

import { useQuizMutations } from "../hooks/useQuizMutations";

type QuizKickButtonProps = {
  quizId: Quiz["id"];
  userId: LocalUser["id"];
};

export const QuizKickButton = ({ quizId, userId }: QuizKickButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useCurrentUser();
  const { kickMutation } = useQuizMutations({
    kick: {
      onSuccess: () => setIsOpen(false),
    },
  });

  if (!currentUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Kick</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kick Attendee</DialogTitle>
        </DialogHeader>
        <p className="text-neutral-600 dark:text-neutral-400">
          Are you sure you want to kick this attendee from the quiz? This action
          cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={kickMutation.isPending}
            onClick={() => kickMutation.mutate({ quizId, userId })}
          >
            {kickMutation.isPending ? "Kicking..." : "Kick"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
