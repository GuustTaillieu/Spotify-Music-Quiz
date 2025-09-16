import {
  BookOpen,
  LucideIcon,
  PersonStanding,
  ScanEye,
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
            title: "Favorites",
            url: "/quiz/favorites",
          },
        ],
      },
    ],
  },
  authenticated: {
    default: [
      {
        title: "Explore quizzes",
        url: "/",
        icon: BookOpen,
        items: [
          {
            title: "Favorites",
            url: "/quiz/favorites",
          },
        ],
      },
      {
        title: "Friends",
        icon: PersonStanding,
        items: [
          {
            title: "Following",
            url: "/user/following",
          },
          {
            title: "Followers",
            url: "/user/followers",
          },
        ],
      },
    ],
    smith: [
      {
        title: "Build",
        url: "/",
        icon: SquareTerminal,
      },
      {
        title: "Overview",
        url: "/",
        icon: ScanEye,
      },
      {
        title: "Documentation",
        url: "/",
        icon: BookOpen,
      },
      {
        title: "Settings",
        url: "/",
        icon: SquareTerminal,
      },
    ],
  },
} satisfies SidebarGroups;
