import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/features/shared/components/ui/button";
import { trpc } from "@/router";

export const Route = createFileRoute("/_guest-only/auth/login")({
  loader: async ({ context: { trpcQueryUtils } }) => {
    const currentUser = await trpcQueryUtils.auth.currentUser.ensureData();
    // if (currentUser) return redirect({ to: "/" });
    await trpcQueryUtils.auth.getSpotifyAuthUrl.prefetch();
  },
  component: LoginPage,
});

function LoginPage() {
  const [url] = trpc.auth.getSpotifyAuthUrl.useSuspenseQuery();

  const handleLogin = () => {
    window.location.href = url;
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="max-w-11/12 flex flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-4xl font-bold">Welcome to Music Quiz</h1>
        <p className="text-lg">
          Sign in with your Spotify account to join and create your own music
          quiz!
        </p>
        <Button onClick={handleLogin} className="btn btn-primary">
          Sign in with Spotify
        </Button>
      </div>
    </div>
  );
}
