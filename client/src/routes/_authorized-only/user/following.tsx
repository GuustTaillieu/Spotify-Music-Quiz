import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authorized-only/user/following')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authorized-only/user/following"!</div>
}
