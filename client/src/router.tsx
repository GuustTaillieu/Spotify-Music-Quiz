import type { AppRouter } from "@music-quiz/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import {
  createTRPCQueryUtils,
  createTRPCReact,
  getQueryKey,
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  splitLink,
  TRPCClientError,
  TRPCLink,
} from "@trpc/react-query";
import { observable } from "@trpc/server/observable";

import { ErrorComponent } from "./features/shared/components/error-component";
import { NotFoundComponent } from "./features/shared/components/not-found-component";
import { Spinner } from "./features/shared/components/ui/spinner";
import { env } from "./lib/utils/env";
import { routeTree } from "./routeTree.gen";

export const queryClient = new QueryClient();

export const trpc = createTRPCReact<AppRouter>();

function getHeaders() {
  const queryKey = getQueryKey(trpc.auth.currentUser);

  const accessToken = queryClient.getQueryData<{ accessToken: string }>(
    queryKey,
  )?.accessToken;

  return {
    Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
  };
}

const customLink: TRPCLink<AppRouter> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next: (result) => observer.next(result),
        error: (error) => {
          if (isTrpcClientError(error)) {
            if (error.data?.code === "UNAUTHORIZED") {
              router.navigate({ to: "/auth/login" });
            }
          }
          observer.error(error);
        },
      });
      return unsubscribe;
    });
  };
};

type LinkOptions = Parameters<typeof httpLink>[0] &
  Parameters<typeof httpBatchLink>[0];

const linkSettings: LinkOptions = {
  url: env.VITE_SERVER_BASE_URL,
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
  headers: getHeaders(),
};

const trpcClient = trpc.createClient({
  links: [
    splitLink({
      condition: (op) => isNonJsonSerializable(op.input),
      true: httpLink(linkSettings),
      false: httpBatchLink(linkSettings),
    }),
    customLink,
  ],
});

export const trpcQueryUtils = createTRPCQueryUtils<AppRouter>({
  queryClient,
  client: trpcClient,
});

function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    context: {
      trpcQueryUtils,
    },
    defaultPendingComponent: () => (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    ),
    defaultErrorComponent: ErrorComponent,
    defaultNotFoundComponent: NotFoundComponent,
    Wrap: function Wrap({ children }) {
      return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </trpc.Provider>
      );
    },
  });

  return router;
}

export const router = createRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}

// For devtools
declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: QueryClient;
  }
}
window.__TANSTACK_QUERY_CLIENT__ = queryClient;

export function isTrpcClientError(
  error: unknown,
): error is TRPCClientError<AppRouter> {
  return error instanceof TRPCClientError;
}
