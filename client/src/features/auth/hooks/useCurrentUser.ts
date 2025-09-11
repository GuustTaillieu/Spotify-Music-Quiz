import { useRouteContext } from "@tanstack/react-router";

export function useCurrentUser() {
  const loaderData = useRouteContext({ from: "__root__" });
  if (!loaderData) return null;

  const { currentUser } = loaderData;
  return currentUser;
}
