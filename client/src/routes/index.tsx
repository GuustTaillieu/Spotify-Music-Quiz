import { createFileRoute } from "@tanstack/react-router";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const { currentUser } = useCurrentUser();

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-3xl font-bold">Music Quiz</h1>
      {currentUser && <h3>Welcome {currentUser.name}</h3>}
    </div>
  );
}
