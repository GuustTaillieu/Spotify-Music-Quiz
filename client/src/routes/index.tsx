import { createFileRoute } from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";

import QuizList from "@/features/quiz/components/quiz-list";
import { InfiniteScroll } from "@/features/shared/components/infinite-scroll";
import { Button } from "@/features/shared/components/ui/button";
import { Link } from "@/features/shared/components/ui/link";
import { Spinner } from "@/features/shared/components/ui/spinner";
import { trpc } from "@/router";

export const Route = createFileRoute("/")({
  component: HomePage,
  loader: async ({ context: { trpcQueryUtils } }) => {
    await trpcQueryUtils.quiz.feed.prefetchInfinite({});
  },
});

function HomePage() {
  const [{ pages }, quizzesQuery] = trpc.quiz.feed.useSuspenseInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  return (
    <div className="space-y-4 py-8">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Feed</h1>
        <Button variant="ghost" asChild>
          <Link to="/quiz/search" className="hover:no-underline">
            <SearchIcon className="size-8" />
            Search
          </Link>
        </Button>
      </div>

      {quizzesQuery.isLoading ? (
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
      ) : quizzesQuery.isError ? (
        <div className="flex items-center justify-center">
          <p className="text-red-500">Error loading experiences</p>
        </div>
      ) : (
        <InfiniteScroll onLoadMore={quizzesQuery.fetchNextPage}>
          <QuizList
            quizzes={pages.flatMap((page) => page.quizzes) ?? []}
            isLoading={quizzesQuery.isFetchingNextPage}
            noQuizzesMessage="No quizzes found"
          />
        </InfiniteScroll>
      )}
    </div>
  );
}
