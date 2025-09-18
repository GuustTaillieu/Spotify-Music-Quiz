import { CompleteRecord } from "./lib/utils/typescript";
import { FileRoutesByFullPath } from "./routeTree.gen";

export const routeNames: CompleteRecord<FileRoutesByFullPath, string> = {
  "/": "Home",
  "/auth/login": "Login",
  "/auth/callback": "Callback",
  "/notification/list": "Notifications",
  "/quiz/create": "Create quiz",
  "/quiz/search": "Search quiz",
  "/quiz/mine": "My quizzes",
  "/quiz/favorites": "Favorites",
  "/user/$userId": "User",
  "/user/followers": "Followers",
  "/user/following": "Following",
};
