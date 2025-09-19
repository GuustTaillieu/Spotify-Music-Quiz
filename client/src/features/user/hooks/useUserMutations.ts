import { LocalUser } from "@music-quiz/server/database/schema";
import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";

import { trpc } from "@/router";

type UseUserMutationsProps = {};

export const useUserMutations = (_?: UseUserMutationsProps) => {
  const utils = trpc.useUtils();
  const { userId: pathUserId, quizId: pathQuizId } = useParams({
    strict: false,
  });

  async function toggleFollowMutate(
    targetUserId: LocalUser["id"],
    updateUser: <T extends { isFollowing: boolean; followersCount: number }>(
      oldData: T,
    ) => T,
  ) {
    // cancel any outgoing refetches (so they don't overwrite our optimistic update)
    const followCancelations = pathUserId
      ? [
          utils.users.followers.cancel({ id: pathUserId }),
          utils.users.following.cancel({ id: pathUserId }),
        ]
      : [];
    const attendeesCancelations = pathQuizId
      ? [
          utils.users.quizAttendees.cancel({
            quizId: pathQuizId,
          }),
        ]
      : [];

    await Promise.all([
      utils.users.byId.cancel({ id: targetUserId }),
      ...followCancelations,
      ...attendeesCancelations,
    ]);

    //   Get previous data
    const followOldData = pathUserId
      ? {
          followers: utils.users.followers.getInfiniteData({
            id: pathUserId,
          }),
          following: utils.users.following.getInfiniteData({
            id: pathUserId,
          }),
        }
      : {};
    const attendeesOldData = pathQuizId
      ? {
          attendees: utils.users.quizAttendees.getInfiniteData({
            quizId: pathQuizId,
          }),
        }
      : {};

    const previousData = {
      byId: utils.users.byId.getData({ id: targetUserId }),
      ...followOldData,
      ...attendeesOldData,
    };

    utils.users.byId.setData({ id: targetUserId }, (oldData) => {
      if (!oldData) return;

      return updateUser(oldData);
    });

    if (pathUserId) {
      utils.users.followers.setInfiniteData({ id: pathUserId }, (oldData) => {
        if (!oldData) return;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            items: page.items.map((user) =>
              user.id === targetUserId ? updateUser(user) : user,
            ),
          })),
        };
      });
    }

    if (pathUserId) {
      utils.users.following.setInfiniteData({ id: pathUserId }, (oldData) => {
        if (!oldData) return;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            items: page.items.map((user) =>
              user.id === targetUserId ? updateUser(user) : user,
            ),
          })),
        };
      });
    }

    if (pathQuizId) {
      utils.users.quizAttendees.setInfiniteData(
        { quizId: pathQuizId },
        (oldData) => {
          if (!oldData) return;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              attendees: page.attendees.map((user) =>
                user.id === targetUserId ? updateUser(user) : user,
              ),
            })),
          };
        },
      );
    }

    return { previousData };
  }

  const handleOnError = (
    id: LocalUser["id"],
    context: Awaited<ReturnType<typeof toggleFollowMutate>> | undefined,
  ) => {
    //   Rollback to previous data
    utils.users.byId.setData({ id }, context?.previousData.byId);

    if (pathUserId) {
      utils.users.followers.setInfiniteData(
        { id: pathUserId },
        context?.previousData.followers,
      );
      utils.users.following.setInfiniteData(
        { id: pathUserId },
        context?.previousData.following,
      );
    }

    if (pathQuizId) {
      utils.users.quizAttendees.setInfiniteData(
        { quizId: pathQuizId },
        context?.previousData.attendees,
      );
    }
  };

  const followMutation = trpc.users.follow.useMutation({
    onMutate: async ({ id }) => {
      function updateUser<
        T extends { isFollowing: boolean; followersCount: number },
      >(oldData: T) {
        return {
          ...oldData,
          isFollowing: true,
          followersCount: oldData.followersCount + 1,
        };
      }

      return toggleFollowMutate(id, updateUser);
    },
    onError: (_, { id }, context) => {
      toast.error("Error following user", {
        description: "An error occurred while trying to follow the user.",
      });
      handleOnError(id, context);
    },
  });

  const unfollowMutation = trpc.users.unfollow.useMutation({
    onMutate: async ({ id }) => {
      function updateUser<
        T extends { isFollowing: boolean; followersCount: number },
      >(oldData: T) {
        return {
          ...oldData,
          isFollowing: false,
          followersCount: Math.max(0, oldData.followersCount - 1),
        };
      }

      return toggleFollowMutate(id, updateUser);
    },
    onError: (_, { id }, context) => {
      toast.error("Error unfollowing user", {
        description: "An error occurred while trying to unfollow the user.",
      });
      handleOnError(id, context);
    },
  });

  return {
    followMutation,
    unfollowMutation,
  };
};
