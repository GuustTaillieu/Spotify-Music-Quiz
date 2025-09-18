import { relations } from "drizzle-orm";

import {
  notificationsTable,
  quizAttendeesTable,
  quizesTable,
  quizFavoritesTable,
  userFollowsTable,
  usersTable,
} from "./schema";

export const quizesRelations = relations(quizesTable, ({ many, one }) => ({
  attendees: many(quizAttendeesTable),
  notifications: many(notificationsTable),
  user: one(usersTable, {
    fields: [quizesTable.userId],
    references: [usersTable.id],
  }),
}));

export const quizAttendeesRelations = relations(
  quizAttendeesTable,
  ({ one }) => ({
    quiz: one(quizesTable, {
      fields: [quizAttendeesTable.quizId],
      references: [quizesTable.id],
    }),
    user: one(usersTable, {
      fields: [quizAttendeesTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const quizFavoritesRelations = relations(
  quizFavoritesTable,
  ({ one }) => ({
    quiz: one(quizesTable, {
      fields: [quizFavoritesTable.quizId],
      references: [quizesTable.id],
    }),
    user: one(usersTable, {
      fields: [quizFavoritesTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const notificationsRelations = relations(
  notificationsTable,
  ({ one }) => ({
    experience: one(quizesTable, {
      fields: [notificationsTable.quizId],
      references: [quizesTable.id],
    }),
    fromUser: one(usersTable, {
      fields: [notificationsTable.fromUserId],
      references: [usersTable.id],
    }),
    user: one(usersTable, {
      fields: [notificationsTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const usersRelations = relations(usersTable, ({ many }) => ({
  experienceFavorites: many(quizFavoritesTable),
  followers: many(userFollowsTable, { relationName: "following" }),
  following: many(userFollowsTable, { relationName: "follower" }),
  notifications: many(notificationsTable),
  notificationsFrom: many(notificationsTable, {
    relationName: "fromUser",
  }),
}));

export const userFollowsRelations = relations(userFollowsTable, ({ one }) => ({
  follower: one(usersTable, {
    fields: [userFollowsTable.followerId],
    references: [usersTable.id],
  }),
  following: one(usersTable, {
    fields: [userFollowsTable.followingId],
    references: [usersTable.id],
  }),
}));
