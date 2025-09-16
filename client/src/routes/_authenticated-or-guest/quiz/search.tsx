import { quizFiltersSchema } from "@music-quiz/shared/schema/quiz";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { QuizFilters } from "@/features/quiz/components/quiz-filters";
import { InfiniteScroll } from "@/features/shared/components/infinite-scroll";
import { Spinner } from "@/features/shared/components/ui/spinner";
import { trpc } from "@/router";

export const Route = createFileRoute("/_authenticated-or-guest/quiz/search")({
  component: SearchPage,
  validateSearch: quizFiltersSchema,
});

function SearchPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const search = Route.useSearch();

  const isSearching = !!search.q;

  const quizQuery = trpc.quiz.search.useInfiniteQuery(search, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: isSearching,
  });

  return (
    <main className="space-y-4">
      <QuizFilters
        initialFilters={search}
        onFiltersChange={(filters) => navigate({ search: filters })}
      />
      {quizQuery.isFetching ? (
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
      ) : quizQuery.isError ? (
        <div className="flex items-center justify-center">
          <p className="text-red-500">Error loading experiences</p>
        </div>
      ) : (
        <InfiniteScroll
          onLoadMore={isSearching ? quizQuery.fetchNextPage : undefined}
        >
          <ExperienceList
            experiences={
              quizQuery.data?.pages.flatMap((page) => page.quizes) ?? []
            }
            isLoading={quizQuery.isFetchingNextPage}
            noExperiencesMessage={
              isSearching
                ? "No experiences found matching your criteria"
                : "Search to see results"
            }
          />
        </InfiniteScroll>
      )}
    </main>
  );
}
