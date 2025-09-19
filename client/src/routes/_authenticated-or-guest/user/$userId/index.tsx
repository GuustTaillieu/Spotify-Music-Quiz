import { createFileRoute, LinkProps, notFound } from "@tanstack/react-router";
import { MartiniIcon } from "lucide-react";
import { z } from "zod";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import QuizList from "@/features/quiz/components/quiz-list";
import { ErrorComponent } from "@/features/shared/components/error-component";
import { InfiniteScroll } from "@/features/shared/components/infinite-scroll";
import { Card } from "@/features/shared/components/ui/card";
import { Link } from "@/features/shared/components/ui/link";
import { UserAvatar } from "@/features/user/components/user-avatar";
import { UserFollowButton } from "@/features/user/components/user-follow-button";
import { UserForDetails } from "@/features/user/types";
import { isTrpcClientError, trpc } from "@/router";

export const Route = createFileRoute("/_authenticated-or-guest/user/$userId/")({
  params: {
    parse: (params) => ({
      userId: z.coerce.number().parse(params.userId),
    }),
  },
  component: UserPage,
  loader: async ({ context: { trpcQueryUtils }, params }) => {
    try {
      await trpcQueryUtils.users.byId.ensureData({
        id: params.userId,
      });
      await trpcQueryUtils.quiz.byUserId.prefetchInfinite({
        userId: params.userId,
      });
    } catch (error) {
      if (isTrpcClientError(error) && error.data?.code === "NOT_FOUND") {
        throw notFound();
      }
      throw error;
    }
  },
});

function UserPage() {
  const { userId } = Route.useParams();

  const [user] = trpc.users.byId.useSuspenseQuery({ id: userId });
  const [{ pages }, quizzesQuery] = trpc.quiz.byUserId.useSuspenseInfiniteQuery(
    { userId: userId },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  if (quizzesQuery.isError) {
    return <ErrorComponent />;
  }

  return (
    <main className="space-y-4">
      <Card className="flex flex-col items-center gap-4 px-0">
        <UserAvatar
          user={user}
          showName={false}
          canGoToUserPage={false}
          className="size-24 text-2xl font-bold !no-underline"
        />
        <h1 className="text-3xl font-bold">{user.name}</h1>
        <UserProfileStats user={user} />
        <UserProfileButton user={user} />
      </Card>

      <UserProfileHostStats user={user} />

      <h2 className="text-2xl font-bold">Experiences</h2>
      <InfiniteScroll onLoadMore={quizzesQuery.fetchNextPage}>
        <QuizList
          quizzes={pages.flatMap((page) => page.quizzes) ?? []}
          isLoading={quizzesQuery.isLoading || quizzesQuery.isFetchingNextPage}
        />
      </InfiniteScroll>
    </main>
  );
}

type UserProfileStatsProps = {
  user: UserForDetails;
};

type Stat = {
  label: string;
  value: number | string;
  to: LinkProps["to"];
  params?: LinkProps["params"];
};

const UserProfileStats = ({ user }: UserProfileStatsProps) => {
  const stats: Stat[] = [
    {
      label: "Followers",
      value: user.followersCount,
      to: "/user/$userId/followers",
      params: { userId: user.id },
    },
    {
      label: "Following",
      value: user.followingCount,
      to: "/user/$userId/following",
      params: { userId: user.id },
    },
  ];
  return (
    <div className="flex w-full justify-center gap-12 border-y-2 border-neutral-200 py-4 dark:border-neutral-800">
      {stats.map((stat) => (
        <Link
          to={stat.to}
          params={stat.params}
          key={stat.label}
          variant="ghost"
          className="text-center"
        >
          <div className="dark:text-primary-500 text-secondary-500 text-center text-2xl font-bold">
            {stat.value}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {stat.label}
          </div>
        </Link>
      ))}
    </div>
  );
};

type UserProfileHostStatsProps = {
  user: UserForDetails;
};

const UserProfileHostStats = ({ user }: UserProfileHostStatsProps) => {
  return (
    <Card className="space-y-2">
      <h3 className="text-center text-lg font-semibold">Host Stats</h3>
      <div className="flex flex-row items-center justify-center gap-2 text-neutral-600 dark:text-neutral-400">
        <MartiniIcon className="size-5" />
        {user.ownedQuizzesCount}
      </div>
    </Card>
  );
};

type UserProfileButtonProps = {
  user: UserForDetails;
};

const UserProfileButton = ({ user }: UserProfileButtonProps) => {
  const { currentUser } = useCurrentUser();
  const isCurrentUser = currentUser?.id === user.id;

  return (
    !isCurrentUser && (
      <UserFollowButton targetUserId={user.id} isFollowing={user.isFollowing} />
    )
  );
};
