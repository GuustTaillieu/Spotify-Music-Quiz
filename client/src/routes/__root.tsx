import {
  createRootRouteWithContext,
  FileRoutesByPath,
  Outlet,
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
import { router, trpcQueryUtils } from "@/router";

export type RouterAppContext = {
  trpcQueryUtils: typeof trpcQueryUtils;
};

export const Route = createRootRouteWithContext<RouterAppContext>()({
  beforeLoad: async ({ context: { trpcQueryUtils } }) => {
    const currentUser = await trpcQueryUtils.auth.currentUser.ensureData();
    return { currentUser };
  },
  component: Root,
});

function Root() {
  return (
    <SidebarProvider>
      <ThemeProvider defaultTheme="dark">
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
                {
                  routeNames[
                    router.state.location.pathname as keyof FileRoutesByPath
                  ]
                }
              </h3>
            </div>
          </header>
          <Outlet />
        </SidebarInset>
        <Toaster />
      </ThemeProvider>
    </SidebarProvider>
  );
}
