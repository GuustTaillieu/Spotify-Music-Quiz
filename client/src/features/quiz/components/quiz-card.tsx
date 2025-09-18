import { Users } from "lucide-react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/button";
import { Card } from "@/features/shared/components/ui/card";
import { Link } from "@/features/shared/components/ui/link";
import { UserAvatar } from "@/features/user/user-avatar";

import { QuizForList } from "../types";
import { QuizAttendButton } from "./quiz-attend-button";
import { QuizDeleteDialog } from "./quiz-delete-dialog";
import { QuizFavoriteButton } from "./quiz-favorite-button";

type QuizCardProps = {
  quiz: QuizForList;
};

export const QuizCard = ({ quiz }: QuizCardProps) => {
  return (
    <Card className="overflow-hidden p-0">
      <QuizCardMedia quiz={quiz} />
      <div className="flex items-start gap-4 p-4">
        <QuizCardAvatar quiz={quiz} />
        <div className="flex flex-col gap-4">
          <QuizCardHeader quiz={quiz} />
          <div className="-ml-4">
            <QuizCardMetricButtons quiz={quiz} />
            <QuizCardActionButtons quiz={quiz} />
          </div>
        </div>
      </div>
    </Card>
  );
};

type QuizCardAvatarProps = Pick<QuizCardProps, "quiz">;

const QuizCardAvatar = ({ quiz }: QuizCardAvatarProps) => {
  return <UserAvatar user={quiz.user} showName={false} />;
};

type QuizCardMediaProps = Pick<QuizCardProps, "quiz">;

const QuizCardMedia = ({ quiz }: QuizCardMediaProps) => {
  if (!quiz.imageUrl) return null;

  return (
    <div className="aspect-video w-full">
      <img
        src={quiz.imageUrl}
        alt={quiz.title}
        className="size-full object-cover"
      />
    </div>
  );
};

type QuizCardHeaderProps = Pick<QuizCardProps, "quiz">;

const QuizCardHeader = ({ quiz }: QuizCardHeaderProps) => {
  return (
    <div className="flex flex-col">
      <Link
        to="/users/$userId"
        params={{ userId: quiz.user.id }}
        variant="ghost"
        className="text-sm"
      >
        {quiz.user.name}
      </Link>
      <Link to="/quiz/$quizId" params={{ quizId: quiz.id }}>
        <h2 className="truncate text-xl font-semibold">{quiz.title}</h2>
      </Link>
    </div>
  );
};

type QuizCardMetricButtonsProps = Pick<QuizCardProps, "quiz">;

const QuizCardMetricButtons = ({ quiz }: QuizCardMetricButtonsProps) => {
  return (
    <div className="flex items-center">
      <QuizFavoriteButton
        quizId={quiz.id}
        isFavorited={quiz.isFavorited}
        favoritesCount={quiz.favoritesCount}
      />
      <Button variant="link" asChild>
        <Link to="/quiz/$quizId/attendees" params={{ quizId: quiz.id }}>
          <Users className="size-5" />
          <span>{quiz.attendeesCount}</span>
        </Link>
      </Button>
    </div>
  );
};

type QuizCardActionButtonsProps = Pick<QuizCardProps, "quiz">;

const QuizCardActionButtons = ({ quiz }: QuizCardActionButtonsProps) => {
  const { currentUser } = useCurrentUser();

  const isOwner = currentUser?.id === quiz.user.id;

  if (isOwner) return <QuizCardOwnerButtons quiz={quiz} />;

  if (currentUser)
    return <QuizAttendButton quizId={quiz.id} isAttending={quiz.isAttending} />;

  return null;
};

type QuizCardOwnerButtonsProps = Pick<QuizCardProps, "quiz">;

const QuizCardOwnerButtons = ({ quiz }: QuizCardOwnerButtonsProps) => {
  return (
    <div className="flex gap-4">
      <Button variant="link" asChild>
        <Link to="/quiz/$quizId/edit" params={{ quizId: quiz.id }}>
          Edit
        </Link>
      </Button>
      <QuizDeleteDialog quiz={quiz} />
    </div>
  );
};
