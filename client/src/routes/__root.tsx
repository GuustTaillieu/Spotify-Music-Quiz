import {
  createRootRouteWithContext,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";

import { AppSidebar } from "@/features/shared/components/sidebar/app-sidebar";
import { ThemeProvider } from "@/features/shared/components/theme-provider";
import { Separator } from "@/features/shared/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/features/shared/components/ui/sidebar";
import { Toaster } from "@/features/shared/components/ui/sonner";
import { routeNames } from "@/routeNames";
import { trpcQueryUtils } from "@/router";

export type RouterAppContext = {
  trpcQueryUtils: typeof trpcQueryUtils;
};

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: Root,
  beforeLoad: async ({ context: { trpcQueryUtils } }) => {
    // the access token is only valid for 7 days so current user can only be in cache for 7 days
    const { currentUser } = await trpcQueryUtils.auth.currentUser.ensureData(
      undefined,
      {
        staleTime: 7 * 24 * 60 * 60 * 1000,
      },
    );
    if (currentUser) {
      await trpcQueryUtils.quiz.byUserId.prefetch({ userId: currentUser.id });
    }
    return { currentUser };
  },
});

function Root() {
  const { location } = useRouterState();

  return (
    <ThemeProvider defaultTheme="dark">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <h3 className="text-sm font-medium">
                {routeNames[location.pathname as keyof typeof routeNames]}
              </h3>
            </div>
          </header>
          <main className="flex-1 overflow-auto px-12">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </ThemeProvider>
  );
}
