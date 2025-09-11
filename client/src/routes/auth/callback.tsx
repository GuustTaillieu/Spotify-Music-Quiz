import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

const searchSchema = z.object({
  code: z.string(),
  state: z.string(),
});

export const Route = createFileRoute("/auth/callback")({
  validateSearch: searchSchema,
  beforeLoad: async ({
    search: { code, state },
    context: { trpcQueryUtils },
  }) => {
    await trpcQueryUtils.auth.exchangeToken.prefetch({
      code,
      state,
    });
    return redirect({ to: "/" });
  },
});
