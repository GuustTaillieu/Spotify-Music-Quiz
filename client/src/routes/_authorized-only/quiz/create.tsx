import { createFileRoute } from "@tanstack/react-router";

import { QuizForm } from "@/features/quiz/components/quiz-form";
import { Card } from "@/features/shared/components/ui/card";
import { router } from "@/router";

export const Route = createFileRoute("/_authorized-only/quiz/create")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">New quiz</h1>
      <Card className="p-6">
        <QuizForm
          onSuccess={(id) =>
            router.navigate({
              to: "/quiz/$quizId",
              params: { quizId: id },
            })
          }
          onCancel={() => router.history.back()}
        />
      </Card>
    </main>
  );
}
