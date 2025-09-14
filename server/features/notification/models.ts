import { index, int, text } from "drizzle-orm/sqlite-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";

import { quizesTable } from "../quiz/models";
import { usersTable } from "../user/models";

const notificationTypeEnum = [
  "user_attending_quiz",
  "user_unattending_quiz",
  "user_commented_quiz",
  "user_followed_user",
  "user_kicked_quiz",
  "user_shared_quiz",
] as const;

export const notificationsTable = sqliteTable(
  "notifications",
  {
    id: int().primaryKey({ autoIncrement: true }),
    type: text("type", {
      enum: notificationTypeEnum,
    }).notNull(),
    read: int("read", { mode: "boolean" }).notNull().default(false),

    quizId: int("quiz_id").references(() => quizesTable.id, {
      onDelete: "cascade",
    }),
    fromUserId: int("from_user_id")
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
      }),
    userId: int("user_id").references(() => usersTable.id, {
      onDelete: "cascade",
    }),

    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    notifications_quiz_id_idx: index("notifications_quiz_id_idx").on(
      table.quizId,
    ),
    notifications_from_user_id_idx: index("notifications_from_user_id_idx").on(
      table.fromUserId,
    ),
    notifications_user_id_idx: index("notifications_user_id_idx").on(
      table.userId,
    ),
  }),
);

export const notificationSelectSchema = createSelectSchema(notificationsTable);

export type Notification = typeof notificationsTable.$inferSelect;
