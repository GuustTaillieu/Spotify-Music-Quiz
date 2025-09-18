import { createFileRoute } from "@tanstack/react-router";

import QuizList from "@/features/quiz/components/quiz-list";
import { InfiniteScroll } from "@/features/shared/components/infinite-scroll";
import { Spinner } from "@/features/shared/components/ui/spinner";
import { trpc } from "@/router";

export const Route = createFileRoute("/_authorized-only/quiz/mine")({
  loader: async ({ context: { trpcQueryUtils, currentUser } }) => {
    await trpcQueryUtils.quiz.byUserId.prefetchInfinite({
      userId: currentUser.id,
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { currentUser } = Route.useRouteContext();
  const [{ pages }, quizesQuery] = trpc.quiz.byUserId.useSuspenseInfiniteQuery(
    { userId: currentUser.id },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  return (
    <main className="space-y-4">
      {quizesQuery.isLoading ? (
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
      ) : quizesQuery.isError ? (
        <div className="flex items-center justify-center">
          <p className="text-red-500">Error loading experiences</p>
        </div>
      ) : (
        <InfiniteScroll onLoadMore={quizesQuery.fetchNextPage}>
          <QuizList
            quizes={pages.flatMap((page) => page.quizes) ?? []}
            isLoading={quizesQuery.isFetchingNextPage}
            noQuizesMessage="No quizes found"
          />
        </InfiniteScroll>
      )}
    </main>
  );
}
