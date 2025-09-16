import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

import { useSidebar } from "@/features/shared/components/ui/sidebar";
import { sidebarItems } from "@/lib/conststants/sidebar-items";

export const Route = createFileRoute("/_guest-only")({
  component: RouteComponent,
});

function RouteComponent() {
  const { setMenuItems } = useSidebar();

  useEffect(() => {
    setMenuItems(sidebarItems.unauthenticated.default);
  }, [setMenuItems]);

  return <Outlet />;
}
