import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

import { db } from "@/database";
import {
  ACCESS_TOKEN_KEY,
  ACCESS_TOKEN_TTL,
  SPOTIFY_STATE_KEY,
} from "@/utils/constants";
import { randomString } from "@/utils/random";

import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { Spotify } from "../spotify";
import { usersTable, userWithSpotifySchema } from "../user/models";
import { auth } from "./index";

export const authRouter = router({
  getSpotifyAuthUrl: publicProcedure
    .output(z.string())
    .query(async ({ ctx }) => {
      const state = randomString(32);
      ctx.res.cookie(SPOTIFY_STATE_KEY, state, {
        httpOnly: true,
        secure: true,
        maxAge: ACCESS_TOKEN_TTL,
        partitioned: true,
      });
      return Spotify.getAuthUrl(state);
    }),
  exchangeToken: publicProcedure
    .input(
      z.object({
        code: z.string(),
        state: z.string(),
      }),
    )
    .output(z.object({ currentUser: userWithSpotifySchema }))
    .query(async ({ ctx, input: { state, code } }) => {
      const originalState = ctx.req.cookies[SPOTIFY_STATE_KEY];
      if (state !== originalState) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid state",
        });
      }
      ctx.res.clearCookie(SPOTIFY_STATE_KEY);
      const token = await Spotify.getToken(code);

      const accessToken = auth.createToken(token, {
        expiresIn: ACCESS_TOKEN_TTL,
      });

      const spotifyUser = await Spotify.auth(token).getMe();

      // only create user if it doesn't exist
      let localUser = await db.query.usersTable.findFirst({
        where: eq(usersTable.spotifyId, spotifyUser.id),
      });

      if (!localUser) {
        const [newUser] = await db
          .insert(usersTable)
          .values({
            spotifyId: spotifyUser.id,
            name: spotifyUser.display_name,
            imageUrl: spotifyUser.images[0].url,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .returning();
        localUser = newUser;
      }

      const currentUser = { ...spotifyUser, ...localUser };

      ctx.res.cookie(ACCESS_TOKEN_KEY, accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: ACCESS_TOKEN_TTL,
        partitioned: true,
      });

      return { currentUser };
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    ctx.res.clearCookie(ACCESS_TOKEN_KEY);
    ctx.res.clearCookie(SPOTIFY_STATE_KEY);
    return;
  }),

  currentUser: publicProcedure
    .output(
      z.object({
        currentUser: userWithSpotifySchema.nullable(),
      }),
    )
    .query(({ ctx }) => {
      if (!ctx.user) {
        return { currentUser: null, accessToken: null };
      }

      return { currentUser: ctx.user };
    }),
});
