import { and, count, eq } from "drizzle-orm";

import { db } from "../../database";
import {
  Quiz,
  quizAttendeesTable,
  quizFavoritesTable,
  User,
} from "../../database/schema";

export async function getQuizAttendeesCount(quizId: Quiz["id"]) {
  const [attendeesCount] = await db
    .select({ count: count() })
    .from(quizAttendeesTable)
    .where(eq(quizAttendeesTable.quizId, quizId));

  return attendeesCount?.count ?? 0;
}

export async function getQuizFavoritesCount(quizId: Quiz["id"]) {
  const [favoritesCount] = await db
    .select({ count: count() })
    .from(quizFavoritesTable)
    .where(eq(quizFavoritesTable.quizId, quizId));

  return favoritesCount?.count ?? 0;
}

export async function getQuizUserContext(
  quizId: Quiz["id"],
  userId?: User["id"],
) {
  if (!userId) {
    return {
      isAttending: false,
      isFavorited: false,
    };
  }

  const [attendance, favorite] = await Promise.all([
    db.query.quizAttendeesTable.findFirst({
      where: and(
        eq(quizAttendeesTable.quizId, quizId),
        eq(quizAttendeesTable.userId, userId),
      ),
    }),
    db.query.quizFavoritesTable.findFirst({
      where: and(
        eq(quizFavoritesTable.quizId, quizId),
        eq(quizFavoritesTable.userId, userId),
      ),
    }),
  ]);

  return {
    isAttending: !!attendance,
    isFavorited: !!favorite,
  };
}

export async function getQuizAttendees(quizId: Quiz["id"]) {
  const attendees = await db.query.quizAttendeesTable.findMany({
    where: eq(quizAttendeesTable.quizId, quizId),
    limit: 5,
    with: {
      user: {},
    },
  });

  return attendees.map((a) => a.user);
}
