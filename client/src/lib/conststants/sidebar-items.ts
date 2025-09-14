import {
  BookOpen,
  LucideIcon,
  PersonStanding,
  ScanEye,
  SquareTerminal,
} from "lucide-react";

export type SidebarItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: SidebarItem[];
};

type SidebarAuth = "unauthenticated" | "authenticated";

export const sidebarItems = {
  unauthenticated: {
    default: [
      {
        title: "Explore",
        url: "#",
        icon: BookOpen,
        isActive: true,
        items: [
          {
            title: "History",
            url: "#",
          },
          {
            title: "Starred",
            url: "#",
          },
        ],
      },
    ],
  },
  authenticated: {
    default: [
      {
        title: "Explore",
        url: "#",
        icon: BookOpen,
        isActive: true,
        items: [
          {
            title: "History",
            url: "#",
          },
          {
            title: "Starred",
            url: "#",
          },
        ],
      },
      {
        title: "Friends",
        url: "#",
        icon: PersonStanding,
      },
    ],
    smith: [
      {
        title: "Build",
        url: "#",
        icon: SquareTerminal,
      },
      {
        title: "Overview",
        url: "#",
        icon: ScanEye,
      },
      {
        title: "Documentation",
        url: "#",
        icon: BookOpen,
      },
      {
        title: "Settings",
        url: "#",
        icon: SquareTerminal,
      },
    ],
  },
} as const satisfies Record<SidebarAuth, Record<string, SidebarItem[]>>;
