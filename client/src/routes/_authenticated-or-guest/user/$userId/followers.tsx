import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { InfiniteScroll } from "@/features/shared/components/infinite-scroll";
import { UserFollowButton } from "@/features/user/components/user-follow-button";
import { UserList } from "@/features/user/components/user-list";
import { isTrpcClientError, trpc } from "@/router";

export const Route = createFileRoute(
  "/_authenticated-or-guest/user/$userId/followers",
)({
  params: {
    parse: (params) => ({
      userId: z.coerce.number().parse(params.userId),
    }),
  },
  component: UserFollowersPage,
  loader: async ({ context: { trpcQueryUtils }, params }) => {
    try {
      await trpcQueryUtils.users.followers.prefetchInfinite({
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

function UserFollowersPage() {
  const { userId } = Route.useParams();
  const [{ pages }, followersQuery] =
    trpc.users.followers.useSuspenseInfiniteQuery(
      { id: userId },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  const totalFollowers = pages[0]?.followersCount ?? 0;

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Followers ({totalFollowers})</h1>
      <InfiniteScroll onLoadMore={followersQuery.fetchNextPage}>
        <UserList
          users={pages.flatMap((page) => page.items)}
          isLoading={followersQuery.isFetchingNextPage}
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
