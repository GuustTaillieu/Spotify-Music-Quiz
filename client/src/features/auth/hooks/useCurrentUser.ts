import { trpc } from "@/router";

export function useCurrentUser() {
  const { data, ...currentUserQuery } = trpc.auth.currentUser.useQuery();
  if (!data)
    return { ...currentUserQuery, currentUser: null, accessToken: null };

  return {
    currentUser: data.currentUser,
    accessToken: data.accessToken,
    ...currentUserQuery,
  };
}
