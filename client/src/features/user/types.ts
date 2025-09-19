import { LocalUser } from "@music-quiz/server/database/schema";

type UserWithHostedExperiences = LocalUser & {
  ownedQuizzesCount: number;
};

type UserWithFollowCounts = LocalUser & {
  followersCount: number;
  followingCount: number;
};

export type UserWithUserContext = LocalUser & {
  isFollowing: boolean;
};

export type UserForDetails = UserWithHostedExperiences &
  UserWithFollowCounts &
  UserWithUserContext;

export type UserForList = LocalUser;
