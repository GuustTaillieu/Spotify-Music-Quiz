import { desc, eq } from "drizzle-orm";
import { z } from "zod/v4";

import { db } from "../../database";
import { protectedProcedure, router } from "../../trpc";
import { DEFAULT_NOTIFICATION_LIMIT } from "../../utils/constants";
import { userSelectSchema } from "../user/models";
import { questionsSelectSchema, questionsTable } from "./models";

export const questionRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        userId: userSelectSchema.shape.id,
        limit: z.number().optional(),
        cursor: z.number().optional(),
      }),
    )
    .output(
      z.object({
        questions: z.array(questionsSelectSchema),
        nextCursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? DEFAULT_NOTIFICATION_LIMIT;
      const cursor = input?.cursor ?? 0;

      const questions = await db.query.questionsTable.findMany({
        where: eq(questionsTable.userId, ctx.user.id),
        limit: limit,
        offset: cursor,
        orderBy: desc(questionsTable.createdAt),
        with: {
          fromUser: {
            columns: {
              name: true,
            },
          },
        },
      });

      return {
        questions,
        nextCursor: questions.length === limit ? cursor + limit : undefined,
      };
    }),
});
