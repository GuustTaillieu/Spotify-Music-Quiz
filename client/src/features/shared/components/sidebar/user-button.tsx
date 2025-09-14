import { User } from "@music-quiz/server/database/schema";
import { Bell, ChevronsUpDown, LoaderIcon, LogIn, LogOut } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

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

type UserButtonProps = {};

export function UserButton({}: UserButtonProps) {
  const { currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (currentUser) {
      toast.success("You are successfully logged in!");
    }
  }, [currentUser]);

  if (currentUser) return <UserButtonSignedIn currentUser={currentUser} />;
  else if (isLoading) return <UserButtonLoading />;
  else return <UserButtonNotSignedIn />;
}

type UserButtonLoadingProps = {};

function UserButtonLoading({}: UserButtonLoadingProps) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer focus-visible:ring-0"
            >
              <LoaderIcon className="h-8 w-8 rounded-lg" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Loading...</span>
                <span className="truncate text-xs">
                  Please wait while we load your profile
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

type UserButtonNotSignedInProps = {};

function UserButtonNotSignedIn({}: UserButtonNotSignedInProps) {
  const handleLogin = () => router.navigate({ to: "/auth/login" });

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={handleLogin}
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer focus-visible:ring-0"
        >
          <LogIn className="mr-2 h-8 w-8 rounded-lg" />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">Sign in</span>
            <span className="truncate text-xs">Click here to get started</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

type UserButtonSignedInProps = {
  currentUser: User;
};

function UserButtonSignedIn({ currentUser }: UserButtonSignedInProps) {
  const { isMobile } = useSidebar();
  const { logoutMutation } = useAuthMutations({
    logout: {
      onSuccess() {
        router.navigate({ to: "/", replace: true });
      },
    },
  });

  const handleLogout = () => logoutMutation.mutate();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer focus-visible:ring-0"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={currentUser.images[0].url}
                  alt={currentUser.name}
                />
                <AvatarFallback className="rounded-lg">
                  {currentUser?.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{currentUser.name}</span>
                <span className="truncate text-xs">{currentUser.email}</span>
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
                    src={currentUser.images[0].url}
                    alt={currentUser.name}
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {currentUser.name}
                  </span>
                  <span className="truncate text-xs">{currentUser.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuGroup>
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
