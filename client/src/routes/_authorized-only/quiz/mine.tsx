import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

import QuizList from "@/features/quiz/components/quiz-list";
import { InfiniteScroll } from "@/features/shared/components/infinite-scroll";
import { Button } from "@/features/shared/components/ui/button";
import { Link } from "@/features/shared/components/ui/link";
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
  const [{ pages }, quizzesQuery] = trpc.quiz.byUserId.useSuspenseInfiniteQuery(
    { userId: currentUser.id },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  return (
    <main className="space-y-4 py-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Mine</h1>
        <Button variant="ghost" asChild>
          <Link to="/quiz/create" className="hover:no-underline">
            <PlusIcon className="size-8" />
            Create quiz
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
    </main>
  );
}
