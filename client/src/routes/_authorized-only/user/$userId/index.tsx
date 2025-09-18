import { createFileRoute, notFound } from "@tanstack/react-router";
import z from "zod/v4";

import { isTrpcClientError, trpc } from "@/router";

const userDetailParamsSchema = z.object({
  userId: z.coerce.number(),
});

export const Route = createFileRoute("/_authorized-only/user/$userId/")({
  params: userDetailParamsSchema,
  loader: async ({ context: { trpcQueryUtils }, params: { userId } }) => {
    try {
      await trpcQueryUtils.users.byId.ensureData({ id: userId });
    } catch (error) {
      if (isTrpcClientError(error) && error.data?.code === "NOT_FOUND") {
        throw notFound();
      }
      throw error;
    }
  },
  component: UserDetailPage,
});

function UserDetailPage() {
  const { userId } = Route.useParams();
  const [user] = trpc.users.byId.useSuspenseQuery({ id: userId });

  return <div>Hello {user.name}</div>;
}
