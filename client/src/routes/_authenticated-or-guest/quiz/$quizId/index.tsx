import { createFileRoute, notFound } from "@tanstack/react-router";
import z from "zod/v4";

import { QuizDetails } from "@/features/quiz/components/quiz-details";
import { isTrpcClientError, trpc } from "@/router";

const quizDetailParamsSchema = z.object({
  quizId: z.coerce.number(),
});

export const Route = createFileRoute("/_authenticated-or-guest/quiz/$quizId/")({
  component: RouteComponent,
  params: quizDetailParamsSchema,
  loader: async ({ context: { trpcQueryUtils }, params: { quizId } }) => {
    try {
      await trpcQueryUtils.quiz.byId.ensureData({ id: quizId });
    } catch (error) {
      if (isTrpcClientError(error) && error.data?.code === "NOT_FOUND") {
        throw notFound();
      }
      throw error;
    }
  },
});

function RouteComponent() {
  const { quizId } = Route.useParams();
  const [quiz] = trpc.quiz.byId.useSuspenseQuery({
    id: quizId,
  });

  return (
    <main className="space-y-4 pb-20">
      <QuizDetails quiz={quiz} />
    </main>
  );
}
