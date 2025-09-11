import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { ReactNode, useEffect } from "react";

import { useAuthMutations } from "@/features/auth/hooks/useAuthMutations";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/features/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/features/shared/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/features/shared/components/ui/sidebar";
import { router } from "@/router";
import { toast } from "sonner";

type UserButtonProps = {
  fallback?: ReactNode;
};

export function UserButton({ fallback = null }: UserButtonProps) {
  const currentUser = useCurrentUser();
  const { isMobile } = useSidebar();
  const { logoutMutation } = useAuthMutations({
    logout: {
      onSuccess() {
        router.navigate({ to: "/", replace: true });
      },
    },
  });

  const handleLogout = () => logoutMutation.mutate();

  useEffect(() => {
    if (currentUser) {
      toast.success("You are successfully logged in!");
    }
  }, [currentUser]);

  if (!currentUser) return fallback;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground focus-visible:ring-0"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={currentUser?.images[0].url}
                  alt={currentUser?.display_name}
                />
                <AvatarFallback className="rounded-lg">
                  {currentUser?.display_name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {currentUser?.display_name}
                </span>
                <span className="truncate text-xs">{currentUser?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={currentUser?.images[0].url}
                    alt={currentUser?.display_name}
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {currentUser?.display_name}
                  </span>
                  <span className="truncate text-xs">{currentUser?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            {/* <DropdownMenuSeparator /> */}
            {/* <DropdownMenuGroup> */}
            {/*   <DropdownMenuItem> */}
            {/*     <Sparkles /> */}
            {/*     Upgrade to Pro */}
            {/*   </DropdownMenuItem> */}
            {/* </DropdownMenuGroup> */}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {/* <DropdownMenuItem> */}
              {/*   <BadgeCheck /> */}
              {/*   Account */}
              {/* </DropdownMenuItem> */}
              {/* <DropdownMenuItem> */}
              {/*   <CreditCard /> */}
              {/*   Billing */}
              {/* </DropdownMenuItem> */}
              <DropdownMenuItem
                onClick={() => router.navigate({ to: "/notifications" })}
              >
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
