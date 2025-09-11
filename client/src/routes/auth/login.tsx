import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/login")({
  loader: async ({ context: { trpcQueryUtils } }) => {
    const currentUser = await trpcQueryUtils.auth.currentUser.ensureData();
    if (currentUser) return redirect({ to: "/" });

    const url = await trpcQueryUtils.auth.getSpotifyAuthUrl.ensureData();
    return (window.location.href = url);
  },
});
