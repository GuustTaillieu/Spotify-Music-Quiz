import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";

import { useSidebar } from "@/features/shared/components/ui/sidebar";
import { sidebarItems } from "@/lib/conststants/sidebar-items";

export const Route = createFileRoute("/_authorized-only")({
  component: RouteComponent,
  beforeLoad: async ({ context: { trpcQueryUtils } }) => {
    const currentUser = await trpcQueryUtils.auth.currentUser.ensureData();
    if (!currentUser) {
      return redirect({ to: "/auth/login" });
    }
  },
});

function RouteComponent() {
  const { setMenuItems } = useSidebar();

  useEffect(() => {
    setMenuItems(sidebarItems.authenticated.default);
  }, [setMenuItems]);

  return <Outlet />;
}
