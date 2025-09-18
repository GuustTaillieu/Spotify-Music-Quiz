import { initTRPC, TRPCError } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { eq } from "drizzle-orm";
import { z, ZodError } from "zod/v4";

import { db } from "./database";
import { auth } from "./features/auth";
import { Token } from "./features/auth/models";
import { Spotify } from "./features/spotify";
import { SpotifyToken } from "./features/spotify/models";
import { User, usersTable } from "./features/user/models";
import { ACCESS_TOKEN_KEY, ACCESS_TOKEN_TTL } from "./utils/constants";

type Context = Awaited<ReturnType<typeof createContext>>;

// Create context for each request
export async function createContext(
  opts: trpcExpress.CreateExpressContextOptions,
) {
  const context = {
    req: opts.req,
    res: opts.res,
    spotifyToken: null as SpotifyToken | null,
    user: null as User | null,
  };

  const authHeader = opts.req.headers.authorization;

  // If no authorization header, return
  if (!authHeader) {
    return context;
  }

  // Get token from cookie
  const token = opts.req.cookies[ACCESS_TOKEN_KEY];

  // Verify the token
  const spotifyToken = auth.verifyToken<Token>(token);

  // If the token is invalid, try to get it from cookie
  if (!spotifyToken) {
    return context;
  }

  const isExpired = await auth.isTokenExpired(spotifyToken);

  if (isExpired) {
    console.log("refreshing token");

    const newSpotifyToken = await Spotify.auth(spotifyToken).refreshToken();

    const newAccessToken = auth.createToken<SpotifyToken>(newSpotifyToken, {
      expiresIn: "1h",
    });

    opts.res.cookie(ACCESS_TOKEN_KEY, newAccessToken, {
      httpOnly: true,
      secure: true,
      maxAge: ACCESS_TOKEN_TTL,
      partitioned: true,
    });

    context.spotifyToken = newSpotifyToken;
  } else {
    context.spotifyToken = spotifyToken;
  }

  const spotifyUser = await Spotify.auth(context.spotifyToken).getMe();
  const localUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.spotifyId, spotifyUser.id),
  });

  if (!localUser || !spotifyUser) {
    return context;
  }

  context.user = { ...spotifyUser, ...localUser };

  return context;
}

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  errorFormatter(opts) {
    const { shape, error } = opts;
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          // Only show zod errors for bad request errors
          error.code === "BAD_REQUEST" && error.cause instanceof ZodError
            ? z.treeifyError(error.cause)
            : null,
      },
    };
  },
});

// Create protected procedure
const authMiddleware = t.middleware(async ({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  return next({
    ctx: {
      ...ctx,
      // Ready to be used in procedures
      spotifyToken: ctx.spotifyToken as Token,
      user: ctx.user as User,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(authMiddleware);
