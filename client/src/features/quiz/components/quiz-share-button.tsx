import { LocalUser, Quiz } from "@music-quiz/server/database/schema";
import { Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/features/shared/components/ui/dialog";
import {
  ScrollArea,
  ScrollBar,
} from "@/features/shared/components/ui/scroll-area";
import { UserList } from "@/features/user/components/user-list";
import { UserSearch } from "@/features/user/components/user-search";

import { useQuizMutations } from "../hooks/useQuizMutations";

type QuizShareButtonProps = {
  quizId: Quiz["id"];
};

export const QuizShareButton = ({ quizId }: QuizShareButtonProps) => {
  const { currentUser } = useCurrentUser();
  const { shareMutation } = useQuizMutations({
    share: {
      onSuccess: () => {
        toast("Quiz shared!", {
          description: "The quiz has been sent!",
        });
        setOpen(false);
      },
      onError: () => setOpen(false),
    },
  });

  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<LocalUser[]>([]);

  if (!currentUser) return null;

  const handleShareQuiz = (user: LocalUser) => {
    shareMutation.mutate({
      quizId,
      toUserId: user.id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link">
          <Share2 className="size-6" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Quiz</DialogTitle>
        </DialogHeader>

        <UserSearch onSearch={(users) => setUsers(users)} />

        <ScrollArea className="h-[300px]">
          <UserList
            users={users.filter((user) => user.id !== currentUser.id)}
            noUsersMessage="No users found"
            rightComponent={(user) => (
              <Button variant="link" onClick={() => handleShareQuiz(user)}>
                {shareMutation.isPending ? "Sending..." : "Send"}
              </Button>
            )}
          />
          <ScrollBar />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
