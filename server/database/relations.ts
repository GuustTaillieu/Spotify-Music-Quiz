import { relations } from "drizzle-orm";

import {
  notificationsTable,
  quizAttendeesTable,
  quizFavoritesTable,
  quizzesTable,
  userFollowsTable,
  usersTable,
} from "./schema";

export const quizzesRelations = relations(quizzesTable, ({ many, one }) => ({
  attendees: many(quizAttendeesTable),
  notifications: many(notificationsTable),
  user: one(usersTable, {
    fields: [quizzesTable.userId],
    references: [usersTable.id],
  }),
}));

export const quizAttendeesRelations = relations(
  quizAttendeesTable,
  ({ one }) => ({
    quiz: one(quizzesTable, {
      fields: [quizAttendeesTable.quizId],
      references: [quizzesTable.id],
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
    quiz: one(quizzesTable, {
      fields: [quizFavoritesTable.quizId],
      references: [quizzesTable.id],
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
    experience: one(quizzesTable, {
      fields: [notificationsTable.quizId],
      references: [quizzesTable.id],
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
