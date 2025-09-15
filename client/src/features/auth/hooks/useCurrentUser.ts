import { trpc } from "@/router";

export function useCurrentUser() {
  const { data, ...currentUserQuery } = trpc.auth.currentUser.useQuery();

  return {
    currentUser: data?.currentUser,
    accessToken: data?.accessToken,
    ...currentUserQuery,
  };
}
