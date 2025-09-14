import {
  index,
  int,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";

import { questionsTable } from "../question/models";
import { usersTable } from "../user/models";

export const quizesTable = sqliteTable(
  "quizes",
  {
    id: int().primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    imageUrl: text("image_url"),

    ownerId: int("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    public: int("public", { mode: "boolean" }).notNull().default(false),

    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("quizes_owner_id_idx").on(table.ownerId)],
);

export const quizesSelectSchema = createSelectSchema(quizesTable);

export type Quiz = typeof quizesTable.$inferSelect;

export const quizQuestionsTable = sqliteTable(
  "quiz_questions",
  {
    quizId: int("quiz_id")
      .notNull()
      .references(() => quizesTable.id, { onDelete: "cascade" }),
    questionId: int("question_id")
      .notNull()
      .references(() => questionsTable.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.quizId, table.questionId],
    }),
    index("quiz_questions_quiz_id_idx").on(table.quizId),
    index("quiz_questions_question_id_idx").on(table.questionId),
  ],
);

export type QuizQuestion = typeof quizQuestionsTable.$inferSelect;

export const quizAttendeesTable = sqliteTable(
  "quiz_attendees",
  {
    quizId: int("quiz_id")
      .notNull()
      .references(() => quizesTable.id, { onDelete: "cascade" }),
    userId: int("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.quizId, table.userId],
    }),
    index("quiz_attendees_quiz_id_idx").on(table.quizId),
    index("quiz_attendees_user_id_idx").on(table.userId),
  ],
);

export type QuizAttendee = typeof quizAttendeesTable.$inferSelect;

export const quizFavoritesTable = sqliteTable(
  "quiz_favorites",
  {
    quizId: int("quiz_id")
      .notNull()
      .references(() => quizesTable.id, { onDelete: "cascade" }),
    userId: int("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.quizId, table.userId],
    }),
    index("quiz_favorites_quiz_id_idx").on(table.quizId),
    index("quiz_favorites_user_id_idx").on(table.userId),
  ],
);

export const quizFavoriteSelectSchema = createSelectSchema(quizFavoritesTable);
export type QuizFavorite = typeof quizFavoritesTable.$inferSelect;
