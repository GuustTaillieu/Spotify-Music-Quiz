import { FileRoutesByPath } from "@tanstack/react-router";

export const routeNames: Record<keyof FileRoutesByPath, string> = {
  "/": "Home",
  "/auth/callback": "Callback",
  "/auth/login": "Login",
} as const;
