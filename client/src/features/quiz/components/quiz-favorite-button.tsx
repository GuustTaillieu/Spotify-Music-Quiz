import { Quiz } from "@music-quiz/server/database/schema";
import { Heart } from "lucide-react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/button";
import { cn } from "@/lib/utils/cn";

import { useQuizMutations } from "../hooks/useQuizMutations";

type QuizFavoriteButtonProps = {
  quizId: Quiz["id"];
  isFavorited: boolean;
  favoritesCount: number;
};

export const QuizFavoriteButton = ({
  quizId,
  isFavorited,
  favoritesCount,
}: QuizFavoriteButtonProps) => {
  const { currentUser } = useCurrentUser();
  const { favoriteMutation, unfavoriteMutation } = useQuizMutations();

  if (!currentUser) return null;

  const handleFavorite = () => {
    if (isFavorited) {
      unfavoriteMutation.mutate({ id: quizId });
    } else {
      favoriteMutation.mutate({ id: quizId });
    }
  };

  return (
    <Button
      variant="link"
      onClick={handleFavorite}
      disabled={favoriteMutation.isPending || unfavoriteMutation.isPending}
    >
      <Heart
        className={cn(
          "size-6 fill-transparent transition-colors",
          isFavorited && "fill-red-500 text-red-500",
        )}
      />
      <span>{favoritesCount}</span>
    </Button>
  );
};
