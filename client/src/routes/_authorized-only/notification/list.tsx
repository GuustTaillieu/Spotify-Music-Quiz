import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authorized-only/notification/list")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/notifications"!</div>;
}
