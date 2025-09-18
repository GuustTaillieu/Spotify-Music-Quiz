import { User } from "@music-quiz/server/database/schema";
import { Bell, ChevronsUpDown, LoaderIcon, LogIn, LogOut } from "lucide-react";
import { ComponentProps, useEffect } from "react";
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
  SidebarMenuButton,
  useSidebar,
} from "@/features/shared/components/ui/sidebar";
import { cn } from "@/lib/utils/cn";
import { router } from "@/router";

type UserButtonProps = {} & ComponentProps<typeof SidebarMenuButton>;

export function UserButton({ ...props }: UserButtonProps) {
  const { currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (currentUser) {
      toast.success("You are successfully logged in!");
    }
  }, [currentUser]);

  if (currentUser)
    return <UserButtonSignedIn currentUser={currentUser} {...props} />;
  else if (isLoading) return <UserButtonLoading {...props} />;
  else return <UserButtonNotSignedIn {...props} />;
}

type UserButtonLoadingProps = UserButtonProps & {};

function UserButtonLoading({ className, ...props }: UserButtonLoadingProps) {
  const { isMobile } = useSidebar();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className={cn(
            "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer focus-visible:ring-0",
            className,
          )}
          {...props}
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
  );
}

type UserButtonNotSignedInProps = UserButtonProps & {};

function UserButtonNotSignedIn({
  className,
  ...props
}: UserButtonNotSignedInProps) {
  const handleLogin = () => router.navigate({ to: "/auth/login" });

  return (
    <SidebarMenuButton
      onClick={handleLogin}
      size="lg"
      className={cn(
        "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer focus-visible:ring-0",
        className,
      )}
      {...props}
    >
      <LogIn className="mr-2 h-8 w-8 rounded-lg" />
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">Sign in</span>
        <span className="truncate text-xs">Click here to get started</span>
      </div>
    </SidebarMenuButton>
  );
}

type UserButtonSignedInProps = UserButtonProps & {
  currentUser: User;
};

function UserButtonSignedIn({
  currentUser,
  className,
  ...props
}: UserButtonSignedInProps) {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className={cn(
            "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer focus-visible:ring-0",
            className,
          )}
          {...props}
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={currentUser.imageUrl} alt={currentUser.name} />
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
              <AvatarImage src={currentUser.imageUrl} alt={currentUser.name} />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{currentUser.name}</span>
              <span className="truncate text-xs">{currentUser.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => router.navigate({ to: "/notification/list" })}
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
  );
}
