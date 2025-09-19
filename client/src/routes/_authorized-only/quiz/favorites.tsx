import { createFileRoute } from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";

import QuizList from "@/features/quiz/components/quiz-list";
import { InfiniteScroll } from "@/features/shared/components/infinite-scroll";
import { Button } from "@/features/shared/components/ui/button";
import { Link } from "@/features/shared/components/ui/link";
import { Spinner } from "@/features/shared/components/ui/spinner";
import { trpc } from "@/router";

export const Route = createFileRoute("/_authorized-only/quiz/favorites")({
  component: FavoriteQuizzesPage,
  loader: async ({ context: { trpcQueryUtils } }) => {
    await trpcQueryUtils.quiz.favorites.prefetchInfinite({});
  },
});

function FavoriteQuizzesPage() {
  const [{ pages }, favoritesQuery] =
    trpc.quiz.favorites.useSuspenseInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  return (
    <main className="space-y-4 py-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Favorites</h1>
        <Button variant="ghost" asChild>
          <Link to="/quiz/search" className="hover:no-underline">
            <SearchIcon className="size-8" />
            Search
          </Link>
        </Button>
      </div>

      <InfiniteScroll onLoadMore={favoritesQuery.fetchNextPage}>
        <QuizList
          quizzes={pages.flatMap((page) => page.quizzes) ?? []}
          isLoading={favoritesQuery.isFetchingNextPage}
          noQuizzesMessage="No favorites found"
        />
      </InfiniteScroll>
      {favoritesQuery.isFetching ? (
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        favoritesQuery.isError && (
          <div className="flex items-center justify-center">
            <p className="text-red-500">Error loading experiences</p>
          </div>
        )
      )}
    </main>
  );
}
