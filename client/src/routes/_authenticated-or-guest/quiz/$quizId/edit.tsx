import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { QuizForm } from "@/features/quiz/components/quiz-form";
import { Card } from "@/features/shared/components/ui/card";
import { isTrpcClientError, router, trpc } from "@/router";

const quizDetailParamsSchema = z.object({
  quizId: z.coerce.number(),
});

export const Route = createFileRoute(
  "/_authenticated-or-guest/quiz/$quizId/edit",
)({
  params: quizDetailParamsSchema,
  component: QuizEditPage,
  loader: async ({ context: { trpcQueryUtils }, params }) => {
    const { currentUser } = await trpcQueryUtils.auth.currentUser.ensureData();

    try {
      const quiz = await trpcQueryUtils.quiz.byId.ensureData({
        id: params.quizId,
      });

      if (!currentUser || currentUser.id !== quiz.userId) {
        throw redirect({
          to: "/quiz/$quizId",
          params: { quizId: params.quizId },
        });
      }
    } catch (error) {
      if (isTrpcClientError(error) && error.data?.code === "NOT_FOUND") {
        throw notFound();
      }
      throw error;
    }
  },
});

function QuizEditPage() {
  const { quizId } = Route.useParams();

  const [quiz] = trpc.quiz.byId.useSuspenseQuery({
    id: quizId,
  });

  function navigateToQuiz() {
    router.navigate({
      to: "/quiz/$quizId",
      params: { quizId },
    });
  }

  return (
    <main className="space-y-4">
      <Card className="p-6">
        <QuizForm
          quiz={quiz}
          onSuccess={navigateToQuiz}
          onCancel={navigateToQuiz}
        />
      </Card>
    </main>
  );
}
