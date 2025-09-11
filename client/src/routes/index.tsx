import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const { currentUser } = Route.useRouteContext();

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-3xl font-bold">Music Quiz</h1>
      {currentUser && <h3>Welcome {currentUser.display_name}</h3>}
    </div>
  );
}
