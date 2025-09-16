import { createFileRoute } from "@tanstack/react-router";

import QuizList from "@/features/quiz/components/quiz-list";
import { InfiniteScroll } from "@/features/shared/components/infinite-scroll";
import { Spinner } from "@/features/shared/components/ui/spinner";
import { trpc } from "@/router";

export const Route = createFileRoute("/_authorized-only/quiz/favorites")({
  component: RouteComponent,
  loader: async ({ context: { trpcQueryUtils } }) => {
    await trpcQueryUtils.quiz.favorites.prefetchInfinite({});
  },
});

function RouteComponent() {
  const [{ pages }, favoritesQuery] =
    trpc.quiz.favorites.useSuspenseInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  return (
    <main className="space-y-4">
      {favoritesQuery.isFetching ? (
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
      ) : favoritesQuery.isError ? (
        <div className="flex items-center justify-center">
          <p className="text-red-500">Error loading experiences</p>
        </div>
      ) : (
        <InfiniteScroll onLoadMore={favoritesQuery.fetchNextPage}>
          <QuizList
            quizes={pages.flatMap((page) => page.quizes) ?? []}
            isLoading={favoritesQuery.isFetchingNextPage}
            noQuizesMessage="No favorites found"
          />
        </InfiniteScroll>
      )}
    </main>
  );
}
