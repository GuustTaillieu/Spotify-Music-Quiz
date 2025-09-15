import { createFileRoute, redirect } from "@tanstack/react-router";
import z from "zod";

const searchSchema = z.object({
  code: z.string(),
  state: z.string(),
});

export const Route = createFileRoute("/auth/callback")({
  validateSearch: searchSchema,
  beforeLoad: async ({ search: { code, state } }) => ({ code, state }),
  loader: async ({ context: { trpcQueryUtils, state, code } }) => {
    await trpcQueryUtils.auth.exchangeToken.prefetch({ code, state });
    await trpcQueryUtils.auth.currentUser.invalidate();
    return redirect({ to: "/" });
  },
  component: CallbackPage,
});

function CallbackPage() {
  return <div className="p-4">Redirecting...</div>;
}
