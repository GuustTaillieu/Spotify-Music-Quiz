import { userFiltersSchema } from "@music-quiz/shared/schema/user";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { InfiniteScroll } from "@/features/shared/components/infinite-scroll";
import { Spinner } from "@/features/shared/components/ui/spinner";
import { UserFilters } from "@/features/user/components/user-filters";
import { UserList } from "@/features/user/components/user-list";
import { trpc } from "@/router";

export const Route = createFileRoute("/_authenticated-or-guest/user/search")({
  component: SearchPage,
  validateSearch: userFiltersSchema,
  loader: async ({ context: { trpcQueryUtils } }) => {
    await trpcQueryUtils.users.search.prefetchInfinite({});
  },
});

function SearchPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const search = Route.useSearch();

  const isSearching = !!search.q;

  const [{ pages }, userSearchQuery] =
    trpc.users.search.useSuspenseInfiniteQuery(search, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  return (
    <main className="space-y-4 pt-2">
      <UserFilters
        initialFilters={search}
        onFiltersChange={(filters) => navigate({ search: filters })}
      />
      {userSearchQuery.isFetching ? (
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
      ) : userSearchQuery.isError ? (
        <div className="flex items-center justify-center">
          <p className="text-red-500">Error loading experiences</p>
        </div>
      ) : (
        <InfiniteScroll
          onLoadMore={isSearching ? userSearchQuery.fetchNextPage : undefined}
        >
          <UserList
            users={pages.flatMap((page) => page.users) ?? []}
            isLoading={userSearchQuery.isFetchingNextPage}
            noUsersMessage={
              isSearching
                ? "No users found matching your criteria"
                : "Search to see results"
            }
          />
        </InfiniteScroll>
      )}
    </main>
  );
}
