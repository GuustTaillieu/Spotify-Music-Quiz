import { LocalUser, Quiz } from "@music-quiz/server/database/schema";

type QuizWithUser = Quiz & {
  user: LocalUser;
};

type QuizWithUserContext = Quiz & {
  isAttending: boolean;
  isFavorited: boolean;
};

type QuizWithAttendeesCount = Quiz & {
  attendeesCount: number;
};

type QuizWithAttendees = Quiz & {
  attendees: LocalUser[];
};

type QuizWithFavoritesCount = Quiz & {
  favoritesCount: number;
};

export type QuizForList = QuizWithUser &
  QuizWithUserContext &
  QuizWithFavoritesCount &
  QuizWithAttendeesCount;

export type QuizForDetails = QuizWithUser &
  QuizWithUserContext &
  QuizWithAttendees &
  QuizWithAttendeesCount &
  QuizWithFavoritesCount;

export type QuizForEdit = Quiz;
