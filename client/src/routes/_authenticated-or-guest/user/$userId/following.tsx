import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { InfiniteScroll } from "@/features/shared/components/infinite-scroll";
import { UserFollowButton } from "@/features/user/components/user-follow-button";
import { UserList } from "@/features/user/components/user-list";
import { isTrpcClientError, trpc } from "@/router";

export const Route = createFileRoute(
  "/_authenticated-or-guest/user/$userId/following",
)({
  params: {
    parse: (params) => ({
      userId: z.coerce.number().parse(params.userId),
    }),
  },
  component: UserFollowingPage,
  loader: async ({ context: { trpcQueryUtils }, params }) => {
    try {
      await trpcQueryUtils.users.following.prefetchInfinite({
        id: params.userId,
      });
    } catch (error) {
      if (isTrpcClientError(error) && error.data?.code === "NOT_FOUND") {
        throw notFound();
      }
      throw error;
    }
  },
});

function UserFollowingPage() {
  const { userId } = Route.useParams();
  const [{ pages }, followingQuery] =
    trpc.users.following.useSuspenseInfiniteQuery(
      { id: userId },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  const totalFollowing = pages[0]?.followingCount ?? 0;

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Following ({totalFollowing})</h1>
      <InfiniteScroll onLoadMore={followingQuery.fetchNextPage}>
        <UserList
          users={pages.flatMap((page) => page.items)}
          isLoading={followingQuery.isFetchingNextPage}
          rightComponent={(user) => (
            <UserFollowButton
              targetUserId={user.id}
              isFollowing={user.isFollowing}
            />
          )}
        />
      </InfiniteScroll>
    </main>
  );
}
