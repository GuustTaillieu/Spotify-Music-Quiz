import { Quiz } from "@music-quiz/server/database/schema";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { useState } from "react";

import { Button } from "@/features/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/features/shared/components/ui/dialog";

import { useQuizMutations } from "../hooks/useQuizMutations";

type QuizDeleteDialogProps = {
  quiz: Quiz;
  onSuccess?: (id: Quiz["id"]) => void;
};

export const QuizDeleteDialog = ({
  quiz,
  onSuccess,
}: QuizDeleteDialogProps) => {
  const { deleteMutation } = useQuizMutations({
    delete: {
      onSuccess: (id) => {
        setIsOpen(false);
        onSuccess?.(id);
      },
    },
  });

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" onClick={() => setIsOpen(true)}>
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Quiz</DialogTitle>
        </DialogHeader>
        <p className="text-neutral-500 dark:text-neutral-400">
          Are you sure you want to delete this quiz? This action cannot be
          undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={deleteMutation.isPending}
            variant="destructive"
            onClick={() => deleteMutation.mutate({ id: quiz.id })}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
