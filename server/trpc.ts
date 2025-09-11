import {
  SpotifyToken,
  spotifyTokenSchema,
} from "@music-quiz/shared/schema/auth";
import { initTRPC, TRPCError } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { eq } from "drizzle-orm";
import { ZodError } from "zod";

import { db } from "./database";
import { auth } from "./features/auth";
import { CurrentUser, usersTable } from "./features/auth/models";
import { Spotify } from "./features/spotify";
import { ACCESS_TOKEN_KEY } from "./utils/constants";

// Context available to all procedures
type Context = Awaited<ReturnType<typeof createContext>>;

// Create context for each request
export async function createContext(
  opts: trpcExpress.CreateExpressContextOptions,
) {
  const context = {
    req: opts.req,
    res: opts.res,
    spotifyToken: null as SpotifyToken | null,
  };

  const accessToken = opts.req.cookies[ACCESS_TOKEN_KEY];

  // If no refresh token, return
  if (!accessToken) {
    return context;
  }

  // Verify refresh token
  const payload = auth.verifyToken<SpotifyToken>(accessToken);

  // If refresh token is invalid, return
  const { data: spotifyToken, success } = spotifyTokenSchema.safeParse(payload);
  if (!success) {
    return context;
  }

  const isValid = await Spotify.auth(spotifyToken).verifyToken();

  if (!isValid) {
    const newSpotifyToken = await Spotify.auth(spotifyToken).refreshToken();

    const newAccessToken = auth.createToken<SpotifyToken>(newSpotifyToken, {
      expiresIn: "1h",
    });

    opts.res.cookie(ACCESS_TOKEN_KEY, newAccessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 1000, // 1 hour
    });
  }

  context.spotifyToken = spotifyToken;

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
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

// Create protected procedure
const authMiddleware = t.middleware(({ next, ctx }) => {
  if (!ctx.spotifyToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  return next({
    ctx: {
      ...ctx,
      // Ready to be used in procedures
      spotifyToken: ctx.spotifyToken as SpotifyToken,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(authMiddleware);
