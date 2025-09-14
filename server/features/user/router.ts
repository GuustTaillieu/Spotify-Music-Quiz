import { userFiltersSchema } from "@music-quiz/shared/schema/user";
import { TRPCError } from "@trpc/server";
import { and, count, eq, like } from "drizzle-orm";
import { z } from "zod/v4";

import { db } from "../../database";
import {
  notificationsTable,
  quizAttendeesTable,
  quizesSelectSchema,
  quizesTable,
  userFollowsTable,
} from "../../database/schema";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { DEFAULT_USER_LIMIT } from "../../utils/constants";
import { userSelectSchema, usersTable } from "../user/models";
import {
  getUserFollowContext,
  getUserFollowers,
  getUserFollowersCount,
  getUserFollowing,
  getUserFollowingCount,
  getUserOwnsQuizesCount,
} from "./helpers";

export const userRouter = router({
  search: publicProcedure
    .input(
      z
        .object({
          limit: z.number().optional(),
          cursor: z.number().optional(),
        })
        .extend(userFiltersSchema.shape),
    )
    .output(
      z.object({
        users: z.array(userSelectSchema),
        nextCursor: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      const limit = input.limit ?? DEFAULT_USER_LIMIT;
      const cursor = input.cursor ?? 0;

      const whereConditions = [];
      if (input.q) {
        whereConditions.push(like(usersTable.name, `%${input.q}%`));
      }

      const users = await db.query.usersTable.findMany({
        where: and(...whereConditions),
        limit,
        offset: cursor,
      });
      return {
        users,
        nextCursor: users.length > limit ? cursor + limit : undefined,
      };
    }),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .output(
      userSelectSchema.extend({
        followersCount: z.number(),
        followingCount: z.number(),
        isFollowing: z.boolean(),
        ownedQuizesCount: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, input.id),
        columns: {
          id: true,
          name: true,
          spotifyId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const [followersCount, followingCount, ownedQuizesCount, userContext] =
        await Promise.all([
          getUserFollowersCount(input.id),
          getUserFollowingCount(input.id),
          getUserOwnsQuizesCount(input.id),
          getUserFollowContext(input.id, ctx.user?.id),
        ]);

      return {
        ...user,
        followersCount,
        followingCount,
        isFollowing: userContext.isFollowing,
        ownedQuizesCount,
      };
    }),

  follow: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot follow yourself",
        });
      }

      const existingFollow = await db.query.userFollowsTable.findFirst({
        where: and(
          eq(userFollowsTable.followerId, ctx.user.id),
          eq(userFollowsTable.followingId, input.id),
        ),
      });

      if (existingFollow) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are already following this user",
        });
      }

      await db.insert(userFollowsTable).values({
        followerId: ctx.user.id,
        followingId: input.id,
        createdAt: new Date().toISOString(),
      });

      await db.insert(notificationsTable).values({
        type: "user_followed_user",
        fromUserId: ctx.user.id,
        userId: input.id,
        createdAt: new Date().toISOString(),
      });

      return { success: true };
    }),

  unfollow: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot unfollow yourself",
        });
      }

      const existingFollow = await db.query.userFollowsTable.findFirst({
        where: and(
          eq(userFollowsTable.followerId, ctx.user.id),
          eq(userFollowsTable.followingId, input.id),
        ),
      });

      if (!existingFollow) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not following this user",
        });
      }

      await db
        .delete(userFollowsTable)
        .where(
          and(
            eq(userFollowsTable.followerId, ctx.user.id),
            eq(userFollowsTable.followingId, input.id),
          ),
        );

      return { success: true };
    }),

  followers: publicProcedure
    .input(
      z.object({
        id: z.number(),
        cursor: z.number().optional(),
        limit: z.number().optional(),
      }),
    )
    .output(
      z.object({
        items: z.array(
          userSelectSchema.extend({
            followersCount: z.number(),
            followingCount: z.number(),
            isFollowing: z.boolean(),
          }),
        ),
        followersCount: z.number(),
        nextCursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? DEFAULT_USER_LIMIT;
      const cursor = input.cursor ?? 0;

      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, input.id),
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const followers = await getUserFollowers(input.id, limit + 1, cursor);
      const followersCount = await getUserFollowersCount(input.id);

      const items = await Promise.all(
        followers.slice(0, limit).map(async (f) => {
          const [followersCount, followingCount, userContext] =
            await Promise.all([
              getUserFollowersCount(f.follower.id),
              getUserFollowingCount(f.follower.id),
              getUserFollowContext(f.follower.id, ctx.user?.id),
            ]);

          return {
            ...f.follower,
            followersCount,
            followingCount,
            isFollowing: userContext.isFollowing,
          };
        }),
      );

      return {
        items,
        followersCount,
        nextCursor: followers.length > limit ? cursor + limit : undefined,
      };
    }),

  following: publicProcedure
    .input(
      z.object({
        id: z.number(),
        cursor: z.number().optional(),
        limit: z.number().optional(),
      }),
    )
    .output(
      z.object({
        items: z.array(
          userSelectSchema.extend({
            followersCount: z.number(),
            followingCount: z.number(),
            isFollowing: z.boolean(),
          }),
        ),
        followingCount: z.number(),
        nextCursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? DEFAULT_USER_LIMIT;
      const cursor = input.cursor ?? 0;

      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, input.id),
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const following = await getUserFollowing(input.id, limit + 1, cursor);
      const followingCount = await getUserFollowingCount(input.id);

      const items = await Promise.all(
        following.slice(0, limit).map(async (f) => {
          const [followersCount, followingCount, userContext] =
            await Promise.all([
              getUserFollowersCount(f.following.id),
              getUserFollowingCount(f.following.id),
              getUserFollowContext(f.following.id, ctx.user?.id),
            ]);

          return {
            ...f.following,
            followersCount,
            followingCount,
            isFollowing: userContext.isFollowing,
          };
        }),
      );

      return {
        items,
        followingCount,
        nextCursor: following.length > limit ? cursor + limit : undefined,
      };
    }),

  quizAttendees: publicProcedure
    .input(
      z.object({
        quizId: quizesSelectSchema.shape.id,
        limit: z.number().optional(),
        cursor: z.number().optional(),
      }),
    )
    .output(
      z.object({
        attendees: z.array(
          userSelectSchema.extend({
            isFollowing: z.boolean(),
            followersCount: z.number(),
            followingCount: z.number(),
          }),
        ),
        attendeesCount: z.number(),
        nextCursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? DEFAULT_USER_LIMIT;
      const cursor = input.cursor ?? 0;

      const quiz = await db.query.quizesTable.findFirst({
        where: eq(quizesTable.id, input.quizId),
      });

      if (!quiz) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Experience not found",
        });
      }

      const [attendeesCount] = await db
        .select({ count: count() })
        .from(quizAttendeesTable)
        .where(eq(quizAttendeesTable.quizId, input.quizId));

      const attendees = await db.query.quizAttendeesTable.findMany({
        where: eq(quizAttendeesTable.quizId, input.quizId),
        limit,
        offset: cursor,
        with: {
          user: true,
        },
      });

      const items = await Promise.all(
        attendees.map(async (attendee) => {
          const [followersCount, followingCount, userContext] =
            await Promise.all([
              getUserFollowersCount(attendee.user.id),
              getUserFollowingCount(attendee.user.id),
              getUserFollowContext(attendee.user.id, ctx.user?.id),
            ]);

          return {
            ...attendee.user,
            isFollowing: userContext.isFollowing,
            followersCount,
            followingCount,
          };
        }),
      );

      return {
        attendees: items,
        attendeesCount: attendeesCount?.count ?? 0,
        nextCursor: attendees.length === limit ? cursor + limit : undefined,
      };
    }),
});
