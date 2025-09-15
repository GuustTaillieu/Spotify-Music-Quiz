import { createFileRoute } from "@tanstack/react-router";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/button";
import { trpc } from "@/router";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const { currentUser } = useCurrentUser();
  const mutation = trpc.quiz.test.useMutation();

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-3xl font-bold">Music Quiz</h1>
      {currentUser && <h3>Welcome {currentUser.name}</h3>}
      <Button onClick={() => mutation.mutate()}>Play</Button>
    </div>
  );
}
