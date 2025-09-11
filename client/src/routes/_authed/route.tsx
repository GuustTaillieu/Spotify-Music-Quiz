import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed")({
  component: RouteComponent,
  beforeLoad: async ({ context: { trpcQueryUtils } }) => {
    const currentUser = await trpcQueryUtils.auth.currentUser.ensureData();
    if (!currentUser) {
      return redirect({ to: "/auth/login" });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
