import { int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import z from "zod/v4";

import { spotifyUserSchema } from "../spotify/models";

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  spotifyId: text().notNull(),
  name: text().notNull(),
  createdAt: text().notNull(),
  updatedAt: text().notNull(),
});

export const userSelectSchema = createSelectSchema(usersTable);

export const userFollowsTable = sqliteTable(
  "user_follows",
  {
    followerId: int("follower_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    followingId: int("following_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.followerId, table.followingId] })],
);

export const userSchema = userSelectSchema
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .extend(spotifyUserSchema.omit({ id: true, display_name: true }).shape);

export type User = z.infer<typeof userSchema>;
export type LocalUser = typeof usersTable.$inferSelect;
