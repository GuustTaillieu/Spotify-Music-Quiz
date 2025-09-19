import {
  quizFiltersSchema,
  quizValidationSchema,
} from "@music-quiz/shared/schema/quiz";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, like, or } from "drizzle-orm";
import { z } from "zod/v4";

import { db } from "../../database";
import {
  notificationsTable,
  quizAttendeesTable,
  quizFavoritesTable,
  quizzesSelectSchema,
  quizzesTable,
  userSelectSchema,
} from "../../database/schema";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { DEFAULT_QUIZ_LIMIT } from "../../utils/constants";
import { writeFile } from "../../utils/files";
import {
  getQuizAttendees,
  getQuizAttendeesCount,
  getQuizFavoritesCount,
  getQuizUserContext,
} from "./helpers";

export const quizRouter = router({
  byId: publicProcedure
    .input(z.object({ id: quizzesSelectSchema.shape.id }))
    .output(
      quizzesSelectSchema.extend({
        user: userSelectSchema,
        attendees: z.array(userSelectSchema),
        attendeesCount: z.number(),
        favoritesCount: z.number(),
        isAttending: z.boolean(),
        isFavorited: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const quiz = await db.query.quizzesTable.findFirst({
        where: and(
          eq(quizzesTable.id, input.id),
          or(
            eq(quizzesTable.public, true),
            eq(quizzesTable.userId, ctx.user?.id ?? -1),
          ),
        ),
        with: {
          user: {},
        },
      });

      if (!quiz) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quiz not found",
        });
      }

      const [attendeesCount, favoritesCount, userContext, attendees] =
        await Promise.all([
          getQuizAttendeesCount(input.id),
          getQuizFavoritesCount(input.id),
          getQuizUserContext(input.id, ctx.user?.id),
          getQuizAttendees(input.id),
        ]);

      return {
        ...quiz,
        attendeesCount,
        favoritesCount,
        attendees,
        ...userContext,
      };
    }),

  feed: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z.number().optional(),
      }),
    )
    .output(
      z.object({
        quizzes: z.array(
          quizzesSelectSchema.extend({
            user: userSelectSchema,
            attendeesCount: z.number(),
            favoritesCount: z.number(),
            isAttending: z.boolean(),
            isFavorited: z.boolean(),
          }),
        ),
        nextCursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? DEFAULT_QUIZ_LIMIT;
      const cursor = input?.cursor ?? 0;

      const quizzes = await db.query.quizzesTable.findMany({
        limit,
        offset: cursor,
        where: or(
          eq(quizzesTable.public, true),
          eq(quizzesTable.userId, ctx.user?.id ?? -1),
        ),
        with: {
          user: {},
        },
        orderBy: desc(quizzesTable.createdAt),
      });

      const attendeesCountResults = await Promise.all(
        quizzes.map((quiz) => getQuizAttendeesCount(quiz.id)),
      );

      const userContextResults = await Promise.all(
        quizzes.map((quiz) => getQuizUserContext(quiz.id, ctx.user?.id)),
      );

      const favoritesCountResults = await Promise.all(
        quizzes.map((quiz) => getQuizFavoritesCount(quiz.id)),
      );

      return {
        quizzes: quizzes.map((quiz, index) => ({
          ...quiz,
          attendeesCount: attendeesCountResults[index] ?? 0,
          isAttending: !!userContextResults[index].isAttending,
          isFavorited: !!userContextResults[index].isFavorited,
          favoritesCount: favoritesCountResults[index] ?? 0,
        })),
        nextCursor: quizzes.length === limit ? cursor + limit : undefined,
      };
    }),

  search: publicProcedure
    .input(
      z
        .object({
          limit: z.number().optional(),
          cursor: z.number().optional(),
        })
        .extend(quizFiltersSchema.shape),
    )
    .output(
      z.object({
        quizzes: z.array(
          quizzesSelectSchema.extend({
            user: userSelectSchema,
            attendeesCount: z.number(),
            favoritesCount: z.number(),
            isAttending: z.boolean(),
            isFavorited: z.boolean(),
          }),
        ),
        nextCursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? DEFAULT_QUIZ_LIMIT;
      const cursor = input.cursor ?? 0;

      const whereConditions = [];

      if (input.q) {
        whereConditions.push(or(like(quizzesTable.title, `%${input.q}%`)));
      }

      const quizzes = await db.query.quizzesTable.findMany({
        limit,
        offset: cursor,
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        with: {
          user: {},
        },
        orderBy: desc(quizzesTable.createdAt),
      });

      const attendeesCountResults = await Promise.all(
        quizzes.map((quiz) => getQuizAttendeesCount(quiz.id)),
      );

      const userContextResults = await Promise.all(
        quizzes.map((quiz) => getQuizUserContext(quiz.id, ctx.user?.id)),
      );

      const favoritesCountResults = await Promise.all(
        quizzes.map((quiz) => getQuizFavoritesCount(quiz.id)),
      );

      return {
        quizzes: quizzes.map((quiz, index) => ({
          ...quiz,
          attendeesCount: attendeesCountResults[index] ?? 0,
          isAttending: !!userContextResults[index].isAttending,
          isFavorited: !!userContextResults[index].isFavorited,
          favoritesCount: favoritesCountResults[index] ?? 0,
        })),
        nextCursor: quizzes.length === limit ? cursor + limit : undefined,
      };
    }),

  byUserId: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        cursor: z.number().optional(),
        limit: z.number().optional(),
      }),
    )
    .output(
      z.object({
        quizzes: z.array(
          quizzesSelectSchema.extend({
            user: userSelectSchema,
            attendeesCount: z.number(),
            favoritesCount: z.number(),
            isAttending: z.boolean(),
            isFavorited: z.boolean(),
          }),
        ),
        nextCursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? DEFAULT_QUIZ_LIMIT;
      const cursor = input.cursor ?? 0;

      const quizzes = await db.query.quizzesTable.findMany({
        limit,
        offset: cursor,
        where: eq(quizzesTable.userId, input.userId),
        orderBy: desc(quizzesTable.createdAt),
        with: {
          user: {},
        },
      });

      const attendeesCountResults = await Promise.all(
        quizzes.map((quiz) => getQuizAttendeesCount(quiz.id)),
      );

      const userContextResults = await Promise.all(
        quizzes.map((quiz) => getQuizUserContext(quiz.id, ctx.user?.id)),
      );

      const favoritesCountResults = await Promise.all(
        quizzes.map((quiz) => getQuizFavoritesCount(quiz.id)),
      );

      return {
        quizzes: quizzes.map((quiz, index) => ({
          ...quiz,
          attendeesCount: attendeesCountResults[index] ?? 0,
          isAttending: !!userContextResults[index].isAttending,
          isFavorited: !!userContextResults[index].isFavorited,
          favoritesCount: favoritesCountResults[index] ?? 0,
        })),
        nextCursor: quizzes.length === limit ? cursor + limit : undefined,
      };
    }),

  add: protectedProcedure
    .input(quizValidationSchema)
    .mutation(async ({ ctx, input }) => {
      let imagePath = null;
      if (input.image) {
        imagePath = await writeFile(input.image);
      }

      const [quiz] = await db
        .insert(quizzesTable)
        .values({
          title: input.title,
          userId: ctx.user.id,
          imageUrl: imagePath,
          public: input.public,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();

      return quiz;
    }),

  edit: protectedProcedure
    .input(quizValidationSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Quiz ID is required",
        });
      }

      const quiz = await db.query.quizzesTable.findFirst({
        where: eq(quizzesTable.id, input.id),
      });

      if (!quiz) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quiz not found",
        });
      }

      if (quiz.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own quizzes",
        });
      }

      let imagePath = quiz.imageUrl;
      if (input.image) {
        imagePath = await writeFile(input.image);
      }
      const quizzes = await db
        .update(quizzesTable)
        .set({
          title: input.title,
          imageUrl: imagePath,
          public: input.public,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(quizzesTable.id, input.id))
        .returning();

      return quizzes[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: quizzesSelectSchema.shape.id }))
    .mutation(async ({ ctx, input }) => {
      const quiz = await db.query.quizzesTable.findFirst({
        where: eq(quizzesTable.id, input.id),
      });

      if (!quiz) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quiz not found",
        });
      }

      if (quiz.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own quizzes",
        });
      }

      await db.delete(quizzesTable).where(eq(quizzesTable.id, input.id));

      return input.id;
    }),

  attend: protectedProcedure
    .input(z.object({ id: quizzesSelectSchema.shape.id }))
    .mutation(async ({ ctx, input }) => {
      const quiz = await db.query.quizzesTable.findFirst({
        where: eq(quizzesTable.id, input.id),
      });

      if (!quiz) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quiz not found",
        });
      }

      const existingAttendee = await db.query.quizAttendeesTable.findFirst({
        where: and(
          eq(quizAttendeesTable.quizId, input.id),
          eq(quizAttendeesTable.userId, ctx.user.id),
        ),
      });

      if (existingAttendee) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are already attending this quiz",
        });
      }

      await db.insert(quizAttendeesTable).values({
        quizId: input.id,
        userId: ctx.user.id,
        createdAt: new Date().toISOString(),
      });

      await db.insert(notificationsTable).values({
        type: "user_attending_quiz",
        quizId: input.id,
        fromUserId: ctx.user.id,
        userId: quiz.userId,
        createdAt: new Date().toISOString(),
      });

      return { success: true };
    }),

  unattend: protectedProcedure
    .input(z.object({ id: quizzesSelectSchema.shape.id }))
    .mutation(async ({ ctx, input }) => {
      const quiz = await db.query.quizzesTable.findFirst({
        where: eq(quizzesTable.id, input.id),
      });

      if (!quiz) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quiz not found",
        });
      }

      const existingAttendee = await db.query.quizAttendeesTable.findFirst({
        where: and(
          eq(quizAttendeesTable.quizId, input.id),
          eq(quizAttendeesTable.userId, ctx.user.id),
        ),
      });

      if (!existingAttendee) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not attending this quiz",
        });
      }

      await db
        .delete(quizAttendeesTable)
        .where(
          and(
            eq(quizAttendeesTable.quizId, input.id),
            eq(quizAttendeesTable.userId, ctx.user.id),
          ),
        );

      await db.insert(notificationsTable).values({
        type: "user_unattending_quiz",
        quizId: input.id,
        fromUserId: ctx.user.id,
        userId: quiz.userId,
        createdAt: new Date().toISOString(),
      });

      return { success: true };
    }),

  kickAttendee: protectedProcedure
    .input(
      z.object({
        quizId: quizzesSelectSchema.shape.id,
        userId: userSelectSchema.shape.id,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const quiz = await db.query.quizzesTable.findFirst({
        where: eq(quizzesTable.id, input.quizId),
      });

      if (!quiz) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quiz not found",
        });
      }

      if (quiz.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the quiz user can kick attendees",
        });
      }

      if (quiz.userId === input.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot kick the quiz user",
        });
      }

      await db
        .delete(quizAttendeesTable)
        .where(
          and(
            eq(quizAttendeesTable.quizId, input.quizId),
            eq(quizAttendeesTable.userId, input.userId),
          ),
        );

      await db.insert(notificationsTable).values({
        type: "user_kicked_quiz",
        quizId: input.quizId,
        fromUserId: ctx.user.id,
        userId: input.userId,
        createdAt: new Date().toISOString(),
      });

      return { success: true };
    }),

  favorite: protectedProcedure
    .input(z.object({ id: quizzesSelectSchema.shape.id }))
    .mutation(async ({ ctx, input }) => {
      const existingFavorite = await db.query.quizFavoritesTable.findFirst({
        where: and(
          eq(quizFavoritesTable.quizId, input.id),
          eq(quizFavoritesTable.userId, ctx.user.id),
        ),
      });

      if (existingFavorite) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Quiz already favorited",
        });
      }

      await db.insert(quizFavoritesTable).values({
        quizId: input.id,
        userId: ctx.user.id,
        createdAt: new Date().toISOString(),
      });

      return { success: true };
    }),

  unfavorite: protectedProcedure
    .input(z.object({ id: quizzesSelectSchema.shape.id }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(quizFavoritesTable)
        .where(
          and(
            eq(quizFavoritesTable.quizId, input.id),
            eq(quizFavoritesTable.userId, ctx.user.id),
          ),
        );

      return { success: true };
    }),

  favorites: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z.number().optional(),
      }),
    )
    .output(
      z.object({
        quizzes: z.array(
          quizzesSelectSchema.extend({
            user: userSelectSchema,
            attendeesCount: z.number(),
            favoritesCount: z.number(),
            isAttending: z.boolean(),
            isFavorited: z.boolean(),
          }),
        ),
        nextCursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? DEFAULT_QUIZ_LIMIT;
      const cursor = input?.cursor ?? 0;

      const favorites = await db.query.quizFavoritesTable.findMany({
        where: eq(quizFavoritesTable.userId, ctx.user.id),
        limit,
        offset: cursor,
        with: {
          quiz: { with: { user: {} } },
        },
      });

      const quizzes = favorites.map((f) => f.quiz);

      const attendeesCountResults = await Promise.all(
        quizzes.map((quiz) => getQuizAttendeesCount(quiz.id)),
      );

      const userContextResults = await Promise.all(
        quizzes.map((quiz) => getQuizUserContext(quiz.id, ctx.user?.id)),
      );

      const favoritesCountResults = await Promise.all(
        quizzes.map((quiz) => getQuizFavoritesCount(quiz.id)),
      );

      return {
        quizzes: quizzes.map((quiz, index) => ({
          ...quiz,
          attendeesCount: attendeesCountResults[index] ?? 0,
          isAttending: !!userContextResults[index].isAttending,
          isFavorited: !!userContextResults[index].isFavorited,
          favoritesCount: favoritesCountResults[index] ?? 0,
        })),
        nextCursor: quizzes.length === limit ? cursor + limit : undefined,
      };
    }),

  share: protectedProcedure
    .input(
      z.object({
        quizId: z.number(),
        toUserId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await db.insert(notificationsTable).values({
        type: "user_shared_quiz",
        fromUserId: ctx.user.id,
        userId: input.toUserId,
        quizId: input.quizId,
        createdAt: new Date().toISOString(),
      });
    }),
});
