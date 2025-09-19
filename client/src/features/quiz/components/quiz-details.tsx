import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/button";
import { Card } from "@/features/shared/components/ui/card";
import { Link } from "@/features/shared/components/ui/link";
import { UserAvatarList } from "@/features/user/components/user-avatar-list";
import { router } from "@/router";

import { QuizForDetails } from "../types";
import { QuizAttendButton } from "./quiz-attend-button";
import { QuizDeleteDialog } from "./quiz-delete-dialog";
import { QuizFavoriteButton } from "./quiz-favorite-button";
import { QuizShareButton } from "./quiz-share-button";

type QuizDetailsProps = {
  quiz: QuizForDetails;
};

export const QuizDetails = ({ quiz }: QuizDetailsProps) => {
  return (
    <Card className="p-0">
      <QuizDetailsMedia quiz={quiz} />
      <div className="space-y-4 p-4">
        <QuizDetailsHeader quiz={quiz} />
        <QuizDetailsMeta quiz={quiz} />
        <QuizDetailsActionButtons quiz={quiz} />
        <div className="border-y-2 border-neutral-200 py-4 dark:border-neutral-800">
          <QuizDetailsAttendees quiz={quiz} />
        </div>
      </div>
    </Card>
  );
};

type QuizDetailsMediaProps = Pick<QuizDetailsProps, "quiz">;

const QuizDetailsMedia = ({ quiz }: QuizDetailsMediaProps) => {
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

type QuizDetailsHeaderProps = Pick<QuizDetailsProps, "quiz">;

const QuizDetailsHeader = ({ quiz }: QuizDetailsHeaderProps) => {
  return <h1 className="text-2xl font-bold">{quiz.title}</h1>;
};

type QuizDetailsMetaProps = Pick<QuizDetailsProps, "quiz">;

const QuizDetailsMeta = ({ quiz }: QuizDetailsMetaProps) => {
  const { currentUser } = useCurrentUser();

  const date = new Date(quiz.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-400">
      <time>{date}</time>
      {currentUser && <QuizShareButton quizId={quiz.id} />}
    </div>
  );
};

type QuizDetailsAttendeesProps = Pick<QuizDetailsProps, "quiz">;

const QuizDetailsAttendees = ({ quiz }: QuizDetailsAttendeesProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Host</h3>
        <UserAvatarList users={[quiz.user]} totalCount={1} />
      </div>
      <div className="space-y-2">
        <Link to="/quiz/$quizId/attendees" params={{ quizId: quiz.id }}>
          <h3 className="font-medium">Attendees ({quiz.attendeesCount})</h3>
        </Link>
        {quiz.attendeesCount > 0 ? (
          <UserAvatarList
            users={quiz.attendees}
            totalCount={quiz.attendeesCount}
            limit={5}
          />
        ) : (
          <p className="text-neutral-600 dark:text-neutral-400">
            Be the first to attend this event!
          </p>
        )}
      </div>
    </div>
  );
};

type QuizDetailsActionButtonsProps = Pick<QuizDetailsProps, "quiz">;

const QuizDetailsActionButtons = ({ quiz }: QuizDetailsActionButtonsProps) => {
  const { currentUser } = useCurrentUser();

  const isOwner = currentUser?.id === quiz.user.id;
  if (isOwner) return <QuizDetailsOwnerButtons quiz={quiz} />;

  if (currentUser)
    return (
      <>
        <QuizFavoriteButton
          quizId={quiz.id}
          isFavorited={quiz.isFavorited}
          favoritesCount={quiz.favoritesCount}
        />
        <QuizAttendButton quizId={quiz.id} isAttending={quiz.isAttending} />
      </>
    );

  return null;
};

type QuizDetailsOwnerButtonsProps = Pick<QuizDetailsProps, "quiz">;

const QuizDetailsOwnerButtons = ({ quiz }: QuizDetailsOwnerButtonsProps) => {
  return (
    <div className="flex gap-4">
      <Button variant="outline" asChild>
        <Link
          variant="ghost"
          to="/quiz/$quizId/edit"
          params={{ quizId: quiz.id }}
        >
          Edit
        </Link>
      </Button>
      <QuizDeleteDialog
        quiz={quiz}
        onSuccess={() => router.navigate({ to: "/" })}
      />
    </div>
  );
};
