import { createFileRoute, redirect } from "@tanstack/react-router";
import z from "zod";

const searchSchema = z.object({
  code: z.string(),
  state: z.string(),
});

export const Route = createFileRoute("/auth/callback")({
  validateSearch: searchSchema,
  beforeLoad: ({ search: { code, state } }) => ({ code, state }),
  loader: async ({ context: { trpcQueryUtils, code, state } }) => {
    await trpcQueryUtils.auth.exchangeToken.prefetch({
      code,
      state,
    });
    return redirect({ to: "/" });
  },
});
