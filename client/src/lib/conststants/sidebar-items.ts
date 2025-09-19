import {
  BookOpen,
  LucideIcon,
  PersonStanding,
  SquareTerminal,
} from "lucide-react";

import { FileRoutesByFullPath } from "@/routeTree.gen";

export type SidebarItem = {
  title: string;
  icon: LucideIcon;
  items: SidebarItemChild[];
};

export type SidebarItemChild = {
  title: string;
  url: keyof FileRoutesByFullPath;
};

type SidebarAuth = "unauthenticated" | "authenticated";

type SidebarGroups = Record<
  SidebarAuth,
  {
    default: SidebarItem[];
    [key: string]: SidebarItem[];
  }
>;

export const sidebarItems: SidebarGroups = {
  unauthenticated: {
    default: [
      {
        title: "Explore quizzes",
        icon: BookOpen,
        items: [
          {
            title: "Feed",
            url: "/",
          },
          {
            title: "Search",
            url: "/quiz/search",
          },
        ],
      },
    ],
  },
  authenticated: {
    default: [
      {
        title: "Overview",
        icon: BookOpen,
        items: [
          {
            title: "Feed",
            url: "/",
          },
          {
            title: "Search",
            url: "/quiz/search",
          },
          {
            title: "My quizzes",
            url: "/quiz/mine",
          },
          {
            title: "Favorites",
            url: "/quiz/favorites",
          },
        ],
      },
      {
        title: "Users",
        icon: PersonStanding,
        items: [
          {
            title: "Search",
            url: "/user/search",
          },
          {
            title: "Following",
            url: "/user/$userId/following",
          },
          {
            title: "Followers",
            url: "/user/$userId/followers",
          },
        ],
      },
    ],
    smith: [
      {
        title: "Build",
        icon: SquareTerminal,
        items: [
          {
            title: "Overview",
            url: "/",
          },
          {
            title: "Edit",
            url: "/",
          },
        ],
      },
    ],
  },
} satisfies SidebarGroups;
