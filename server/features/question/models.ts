import { index, int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";

import { quizzesTable } from "../quiz/models";
import { usersTable } from "../user/models";

export const questionsTable = sqliteTable(
  "questions",
  {
    id: int().primaryKey({ autoIncrement: true }),
    quizId: int("quiz_id")
      .notNull()
      .references(() => quizzesTable.id, { onDelete: "cascade" }),
    questionType: text("question_type").notNull(),
    spotifyTrackId: text("spotify_id").notNull(),
    timestampToStop: text("timestamp"),
    userId: int("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("questions_quiz_id_idx").on(table.quizId),
    index("questions_user_id_idx").on(table.userId),
  ],
);

export const questionsSelectSchema = createSelectSchema(questionsTable);

export type Question = typeof questionsTable.$inferSelect;
