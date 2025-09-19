import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { QuizKickButton } from "@/features/quiz/components/quiz-kick-button";
import { InfiniteScroll } from "@/features/shared/components/infinite-scroll";
import { UserFollowButton } from "@/features/user/components/user-follow-button";
import { UserList } from "@/features/user/components/user-list";
import { isTrpcClientError, trpc } from "@/router";

export const Route = createFileRoute(
  "/_authenticated-or-guest/quiz/$quizId/attendees",
)({
  params: {
    parse: (params) => ({
      quizId: z.coerce.number().parse(params.quizId),
    }),
  },
  component: AttendeesPage,
  loader: async ({ params, context: { trpcQueryUtils } }) => {
    try {
      await Promise.all([
        trpcQueryUtils.quiz.byId.ensureData({ id: params.quizId }),
        trpcQueryUtils.users.quizAttendees.prefetchInfinite({
          quizId: params.quizId,
        }),
      ]);
    } catch (error) {
      if (isTrpcClientError(error) && error.data?.code === "NOT_FOUND") {
        throw notFound();
      }
      throw error;
    }
  },
});

function AttendeesPage() {
  const { quizId } = Route.useParams();
  const { currentUser } = useCurrentUser();

  const [quiz] = trpc.quiz.byId.useSuspenseQuery({
    id: quizId,
  });
  const [{ pages }, attendeesQuery] =
    trpc.users.quizAttendees.useSuspenseInfiniteQuery(
      { quizId },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );
  const totalAttendees = pages[0].attendeesCount;

  const isOwner = currentUser?.id === quiz.userId;

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Attendees for "{quiz.title}"</h1>
      <div className="space-y-2">
        <h2 className="font-medium">Attendees ({totalAttendees})</h2>
        <InfiniteScroll onLoadMore={attendeesQuery.fetchNextPage}>
          <UserList
            users={pages.flatMap((page) => page.attendees)}
            isLoading={attendeesQuery.isFetchingNextPage}
            rightComponent={(user) => (
              <div className="flex items-center gap-4">
                <UserFollowButton
                  targetUserId={user.id}
                  isFollowing={user.isFollowing}
                />
                {isOwner && <QuizKickButton quizId={quizId} userId={user.id} />}
              </div>
            )}
          />
        </InfiniteScroll>
      </div>
    </main>
  );
}
