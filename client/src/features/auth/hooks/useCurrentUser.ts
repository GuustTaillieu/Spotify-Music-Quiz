import { trpc } from "@/router";

export function useCurrentUser() {
  const currentUserQuery = trpc.auth.currentUser.useQuery();
  if (!currentUserQuery.data) return null;

  return currentUserQuery.data;
}
