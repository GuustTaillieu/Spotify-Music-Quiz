import { ComponentProps } from "react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { QuizSwitcher } from "@/features/quiz/components/quiz-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/features/shared/components/ui/sidebar";

import { SidebarItems } from "./sidebar-items";
import { UserButton } from "./user-button";

type AppSidebarProps = ComponentProps<typeof Sidebar>;

export function AppSidebar({ ...props }: AppSidebarProps) {
  const { currentUser } = useCurrentUser();
  const { open, menuItems } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {open ? (
          <img src="/logo.png" alt="logo" className="max-h-16 w-max" />
        ) : (
          <img src="/logo.png" alt="logo icon" className="size-8" />
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarItems items={menuItems} />
      </SidebarContent>
      <SidebarFooter className="flex flex-col gap-2">
        {currentUser && (
          <QuizSwitcher
            user={currentUser}
            className="group-data-[collapsible=icon]:p-0!"
          />
        )}
        <UserButton className="group-data-[collapsible=icon]:p-0!" />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
