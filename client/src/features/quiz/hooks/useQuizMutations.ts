import { LocalUser, Quiz } from "@music-quiz/server/database/schema";
import { QuizFilterParams } from "@music-quiz/shared/schema/quiz";
import { useParams, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { trpc } from "@/router";

type QuizMutationsOptions = {
  add?: {
    onSuccess?: (id: Quiz["id"]) => void;
  };
  edit?: {
    onSuccess?: (id: Quiz["id"]) => void;
  };
  delete?: {
    onSuccess?: (id: Quiz["id"]) => void;
  };
  kick?: {
    onSuccess?: (id: Quiz["id"]) => void;
  };
  share?: {
    onSuccess?: (id: Quiz["id"]) => void;
    onError?: () => void;
  };
};

export const useQuizMutations = (options: QuizMutationsOptions = {}) => {
  const utils = trpc.useUtils();
  const { currentUser } = useCurrentUser();
  const { userId: pathUserId } = useParams({ strict: false });
  const { q: pathQ } = useSearch({ strict: false });

  const searchPage: { isActive: boolean; params: QuizFilterParams } = {
    isActive: !!pathQ,
    params: { q: pathQ },
  };

  const addMutation = trpc.quiz.add.useMutation({
    onSuccess: async ({ id }) => {
      toast.success("Quiz created", {
        description: "Your quiz has been created successfully.",
      });

      options.add?.onSuccess?.(id);
    },
    onError: (error) => {
      toast.error("Error creating quiz", {
        description: error.message,
      });
    },
  });

  const editMutation = trpc.quiz.edit.useMutation({
    onSuccess: async ({ id }) => {
      await utils.quiz.byId.invalidate({ id });
      const invalidateUserQuizs = pathUserId
        ? [utils.quiz.byUserId.invalidate({ userId: pathUserId })]
        : [];

      const invalidateSearchQuizs = searchPage.isActive
        ? [utils.quiz.search.invalidate(searchPage.params)]
        : [];

      await Promise.all([
        utils.quiz.feed.invalidate(),
        ...invalidateUserQuizs,
        ...invalidateSearchQuizs,
        utils.quiz.favorites.invalidate(),
      ]);

      toast("Quiz updated", {
        description: "Your quiz has been updated successfully.",
      });

      options.edit?.onSuccess?.(id);
    },
    onError: (error) => {
      toast.error("Error updating quiz", {
        description: error.message,
      });
    },
  });

  const deleteMutation = trpc.quiz.delete.useMutation({
    onSuccess: async (id) => {
      const invalidateUserQuizs = pathUserId
        ? [utils.quiz.byUserId.invalidate({ userId: pathUserId })]
        : [];

      const invalidateSearchQuizs = searchPage.isActive
        ? [utils.quiz.search.invalidate(searchPage.params)]
        : [];

      await Promise.all([
        utils.quiz.feed.invalidate(),
        ...invalidateUserQuizs,
        ...invalidateSearchQuizs,
        utils.quiz.favorites.invalidate(),
      ]);

      options.delete?.onSuccess?.(id);

      toast("Quiz deleted", {
        description: "Your quiz has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast.error("Error deleting quiz", {
        description: error.message,
      });
    },
  });

  const attendMutation = trpc.quiz.attend.useMutation({
    onMutate: async ({ id }) => {
      function markAsAttending<
        T extends {
          isAttending: boolean;
          attendeesCount: number;
          attendees?: LocalUser[];
        },
      >(oldData: T) {
        return {
          ...oldData,
          isAttending: true,
          attendeesCount: oldData.attendeesCount + 1,
          ...(oldData.attendees && {
            attendees: [currentUser, ...oldData.attendees],
          }),
        };
      }

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      const invalidateUserQuizs = pathUserId
        ? [utils.quiz.byUserId.cancel({ userId: pathUserId })]
        : [];

      const invalidateSearchQuizs = searchPage.isActive
        ? [utils.quiz.search.cancel(searchPage.params)]
        : [];

      await Promise.all([
        utils.quiz.byId.cancel({ id }),
        utils.quiz.feed.cancel(),
        ...invalidateUserQuizs,
        ...invalidateSearchQuizs,
        utils.quiz.favorites.cancel(),
      ]);

      // Snapshot the previous data
      const previousData = {
        byId: utils.quiz.byId.getData({ id }),
        feed: utils.quiz.feed.getInfiniteData(),
        byUserId: pathUserId
          ? utils.quiz.byUserId.getInfiniteData({ userId: pathUserId })
          : undefined,
        search: searchPage.isActive
          ? utils.quiz.search.getInfiniteData({
              q: pathQ,
            })
          : undefined,
        favorites: utils.quiz.favorites.getInfiniteData(),
      };

      // Optimistically update the cache
      utils.quiz.byId.setData({ id }, (oldData) => {
        if (!oldData) return;
        return markAsAttending(oldData);
      });

      utils.quiz.feed.setInfiniteData({}, (oldData) => {
        if (!oldData) return;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            quizzes: page.quizzes.map((quiz) =>
              quiz.id === id ? markAsAttending(quiz) : quiz,
            ),
          })),
        };
      });

      if (pathUserId) {
        utils.quiz.byUserId.setInfiniteData(
          { userId: pathUserId },
          (oldData) => {
            if (!oldData) return;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                quizzes: page.quizzes.map((quiz) =>
                  quiz.id === id ? markAsAttending(quiz) : quiz,
                ),
              })),
            };
          },
        );
      }

      if (searchPage.isActive) {
        utils.quiz.search.setInfiniteData(searchPage.params, (oldData) => {
          if (!oldData) return;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              quizzes: page.quizzes.map((quiz) =>
                quiz.id === id ? markAsAttending(quiz) : quiz,
              ),
            })),
          };
        });
      }

      utils.quiz.favorites.setInfiniteData({}, (oldData) => {
        if (!oldData) return;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            quizzes: page.quizzes.map((quiz) =>
              quiz.id === id ? markAsAttending(quiz) : quiz,
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (error, { id }, ctx) => {
      toast.error("Error attending quiz", {
        description: error.message,
      });

      // Rollback to the previous data
      utils.quiz.byId.setData({ id }, ctx?.previousData.byId);

      utils.quiz.feed.setInfiniteData({}, ctx?.previousData.feed);

      if (pathUserId) {
        utils.quiz.byUserId.setInfiniteData(
          { userId: pathUserId },
          ctx?.previousData.byUserId,
        );
      }

      if (searchPage.isActive) {
        utils.quiz.search.setInfiniteData(
          searchPage.params,
          ctx?.previousData.search,
        );
      }

      utils.quiz.favorites.setInfiniteData({}, ctx?.previousData.favorites);
    },
  });

  const unattendMutation = trpc.quiz.unattend.useMutation({
    onMutate: async ({ id }) => {
      function markAsUnattending<
        T extends {
          isAttending: boolean;
          attendeesCount: number;
          attendees?: LocalUser[];
        },
      >(oldData: T) {
        return {
          ...oldData,
          isAttending: false,
          attendeesCount: oldData.attendeesCount - 1,
          ...(oldData.attendees && {
            attendees: oldData.attendees.filter(
              (user) => user.id !== currentUser?.id,
            ),
          }),
        };
      }

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      const invalidateUserQuizs = pathUserId
        ? [utils.quiz.byUserId.cancel({ userId: pathUserId })]
        : [];

      const invalidateSearchQuizs = searchPage.isActive
        ? [utils.quiz.search.cancel(searchPage.params)]
        : [];

      await Promise.all([
        utils.quiz.byId.cancel({ id }),
        utils.quiz.feed.cancel(),
        ...invalidateUserQuizs,
        ...invalidateSearchQuizs,
        utils.quiz.favorites.cancel(),
      ]);

      // Snapshot the previous data
      const previousData = {
        byId: utils.quiz.byId.getData({ id }),
        feed: utils.quiz.feed.getInfiniteData(),
        byUserId: pathUserId
          ? utils.quiz.byUserId.getInfiniteData({ userId: pathUserId })
          : undefined,
        search: searchPage.isActive
          ? utils.quiz.search.getInfiniteData({
              q: pathQ,
            })
          : undefined,
        favorites: utils.quiz.favorites.getInfiniteData(),
      };

      // Optimistically update the cache
      utils.quiz.byId.setData({ id }, (oldData) => {
        if (!oldData) return;
        return markAsUnattending(oldData);
      });

      utils.quiz.feed.setInfiniteData({}, (oldData) => {
        if (!oldData) return;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            quizzes: page.quizzes.map((quiz) =>
              quiz.id === id ? markAsUnattending(quiz) : quiz,
            ),
          })),
        };
      });

      if (pathUserId) {
        utils.quiz.byUserId.setInfiniteData(
          { userId: pathUserId },
          (oldData) => {
            if (!oldData) return;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                quizzes: page.quizzes.map((quiz) =>
                  quiz.id === id ? markAsUnattending(quiz) : quiz,
                ),
              })),
            };
          },
        );
      }

      if (searchPage.isActive) {
        utils.quiz.search.setInfiniteData(searchPage.params, (oldData) => {
          if (!oldData) return;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              quizzes: page.quizzes.map((quiz) =>
                quiz.id === id ? markAsUnattending(quiz) : quiz,
              ),
            })),
          };
        });
      }

      utils.quiz.favorites.setInfiniteData({}, (oldData) => {
        if (!oldData) return;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            quizzes: page.quizzes.map((quiz) =>
              quiz.id === id ? markAsUnattending(quiz) : quiz,
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (error, { id }, ctx) => {
      toast.error("Error attending quiz", {
        description: error.message,
      });

      // Rollback to the previous data
      utils.quiz.byId.setData({ id }, ctx?.previousData.byId);

      utils.quiz.feed.setInfiniteData({}, ctx?.previousData.feed);

      if (pathUserId) {
        utils.quiz.byUserId.setInfiniteData(
          { userId: pathUserId },
          ctx?.previousData.byUserId,
        );
      }

      if (searchPage.isActive) {
        utils.quiz.search.setInfiniteData(
          searchPage.params,
          ctx?.previousData.search,
        );
      }

      utils.quiz.favorites.setInfiniteData({}, ctx?.previousData.favorites);
    },
  });

  const favoriteMutation = trpc.quiz.favorite.useMutation({
    onMutate: async ({ id }) => {
      function markAsFavorited<
        T extends { isFavorited: boolean; favoritesCount: number },
      >(oldData: T) {
        return {
          ...oldData,
          isFavorited: true,
          favoritesCount: oldData.favoritesCount + 1,
        };
      }

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      const invalidateUserQuizzes = pathUserId
        ? [utils.quiz.byUserId.cancel({ userId: pathUserId })]
        : [];
      const invalidateSearchQuizzes = searchPage.isActive
        ? [utils.quiz.search.cancel(searchPage.params)]
        : [];

      await Promise.all([
        utils.quiz.byId.cancel({ id }),
        utils.quiz.feed.cancel(),
        ...invalidateUserQuizzes,
        ...invalidateSearchQuizzes,
      ]);

      // Snapshot the previous data
      const previousData = {
        byId: utils.quiz.byId.getData({ id }),
        feed: utils.quiz.feed.getInfiniteData(),
        byUserId: pathUserId
          ? utils.quiz.byUserId.getInfiniteData({ userId: pathUserId })
          : undefined,
        search: searchPage.isActive
          ? utils.quiz.search.getInfiniteData({
              q: pathQ,
            })
          : undefined,
      };

      // Optimistically update the cache
      utils.quiz.byId.setData({ id }, (oldData) => {
        if (!oldData) return;
        return markAsFavorited(oldData);
      });

      utils.quiz.feed.setInfiniteData({}, (oldData) => {
        if (!oldData) return;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            quizzes: page.quizzes.map((quiz) =>
              quiz.id === id ? markAsFavorited(quiz) : quiz,
            ),
          })),
        };
      });

      if (pathUserId) {
        utils.quiz.byUserId.setInfiniteData(
          { userId: pathUserId },
          (oldData) => {
            if (!oldData) return;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                quizzes: page.quizzes.map((quiz) =>
                  quiz.id === id ? markAsFavorited(quiz) : quiz,
                ),
              })),
            };
          },
        );
      }

      if (searchPage.isActive) {
        utils.quiz.search.setInfiniteData(searchPage.params, (oldData) => {
          if (!oldData) return;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              quizzes: page.quizzes.map((quiz) =>
                quiz.id === id ? markAsFavorited(quiz) : quiz,
              ),
            })),
          };
        });
      }

      return { previousData };
    },
    onError: (error, { id }, ctx) => {
      // Rollback to the previous data
      utils.quiz.byId.setData({ id }, ctx?.previousData.byId);
      utils.quiz.feed.setInfiniteData({}, ctx?.previousData.feed);
      if (pathUserId) {
        utils.quiz.byUserId.setInfiniteData(
          { userId: pathUserId },
          ctx?.previousData.byUserId,
        );
      }
      if (searchPage.isActive) {
        utils.quiz.search.setInfiniteData(
          searchPage.params,
          ctx?.previousData.search,
        );
      }

      toast.error("Error favoriting quiz", {
        description: error.message,
      });
    },
  });

  const unfavoriteMutation = trpc.quiz.unfavorite.useMutation({
    onMutate: async ({ id }) => {
      function markAsUnfavorited<
        T extends { isFavorited: boolean; favoritesCount: number },
      >(oldData: T) {
        return {
          ...oldData,
          isFavorited: false,
          favoritesCount: Math.max(0, oldData.favoritesCount - 1),
        };
      }

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      const invalidateUserQuizs = pathUserId
        ? [utils.quiz.byUserId.cancel({ userId: pathUserId })]
        : [];
      const invalidateSearchQuizs = searchPage.isActive
        ? [utils.quiz.search.cancel(searchPage.params)]
        : [];

      await Promise.all([
        utils.quiz.byId.cancel({ id }),
        utils.quiz.feed.cancel(),
        utils.quiz.favorites.cancel(),
        ...invalidateUserQuizs,
        ...invalidateSearchQuizs,
      ]);

      // Snapshot the previous data
      const previousData = {
        byId: utils.quiz.byId.getData({ id }),
        feed: utils.quiz.feed.getInfiniteData(),
        favorites: utils.quiz.favorites.getInfiniteData(),
        byUserId: pathUserId
          ? utils.quiz.byUserId.getInfiniteData({ userId: pathUserId })
          : undefined,
        search: searchPage.isActive
          ? utils.quiz.search.getInfiniteData({
              q: pathQ,
            })
          : undefined,
      };

      // Optimistically update the cache
      utils.quiz.byId.setData({ id }, (oldData) => {
        if (!oldData) return;
        return markAsUnfavorited(oldData);
      });

      utils.quiz.feed.setInfiniteData({}, (oldData) => {
        if (!oldData) return;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            quizzes: page.quizzes.map((quiz) =>
              quiz.id === id ? markAsUnfavorited(quiz) : quiz,
            ),
          })),
        };
      });

      utils.quiz.favorites.setInfiniteData({}, (oldData) => {
        if (!oldData) return;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            quizzes: page.quizzes.filter((quiz) => quiz.id !== id),
          })),
        };
      });

      if (pathUserId) {
        utils.quiz.byUserId.setInfiniteData(
          { userId: pathUserId },
          (oldData) => {
            if (!oldData) return;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                quizzes: page.quizzes.map((quiz) =>
                  quiz.id === id ? markAsUnfavorited(quiz) : quiz,
                ),
              })),
            };
          },
        );
      }

      if (searchPage.isActive) {
        utils.quiz.search.setInfiniteData(searchPage.params, (oldData) => {
          if (!oldData) return;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              quizzes: page.quizzes.map((quiz) =>
                quiz.id === id ? markAsUnfavorited(quiz) : quiz,
              ),
            })),
          };
        });
      }

      return { previousData };
    },
    onError: (error, { id }, ctx) => {
      // Rollback to the previous data
      utils.quiz.byId.setData({ id }, ctx?.previousData.byId);
      utils.quiz.feed.setInfiniteData({}, ctx?.previousData.feed);
      utils.quiz.favorites.setInfiniteData({}, ctx?.previousData.favorites);
      if (pathUserId) {
        utils.quiz.byUserId.setInfiniteData(
          { userId: pathUserId },
          ctx?.previousData.byUserId,
        );
      }
      if (searchPage.isActive) {
        utils.quiz.search.setInfiniteData(
          searchPage.params,
          ctx?.previousData.search,
        );
      }

      toast.error("Error unfavoriting quiz", {
        description: error.message,
      });
    },
  });

  const kickMutation = trpc.quiz.kickAttendee.useMutation({
    onMutate: async ({ quizId, userId }) => {
      await utils.users.quizAttendees.cancel({ quizId });

      const previousData = {
        quizAttendeesById: utils.users.quizAttendees.getInfiniteData({
          quizId,
        }),
      };

      utils.users.quizAttendees.setInfiniteData({ quizId }, (oldData) => {
        if (!oldData) return;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            attendees: page.attendees.filter(
              (attendee) => attendee.id !== userId,
            ),
            attendeesCount: Math.max(0, page.attendeesCount - 1),
          })),
        };
      });

      toast("Attendee kicked", {
        description: "The attendee has been removed from the quiz.",
      });

      return { previousData };
    },
    onSuccess: (_, { quizId }) => {
      options.kick?.onSuccess?.(quizId);
    },
    onError: (error, { quizId }, ctx) => {
      utils.users.quizAttendees.setInfiniteData(
        { quizId },
        ctx?.previousData.quizAttendeesById,
      );

      toast.error("Error kicking attendee", {
        description: error.message,
      });
    },
  });

  const shareMutation = trpc.quiz.share.useMutation({
    onSuccess: (_, { quizId }) => options?.share?.onSuccess?.(quizId),
    onError: (error, {}) => {
      toast.error("Error sharing quiz", {
        description: error.message,
      });
      options?.share?.onError?.();
    },
  });

  return {
    addMutation,
    editMutation,
    deleteMutation,
    attendMutation,
    unattendMutation,
    favoriteMutation,
    unfavoriteMutation,
    kickMutation,
    shareMutation,
  };
};
