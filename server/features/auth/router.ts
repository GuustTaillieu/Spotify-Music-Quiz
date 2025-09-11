import {
  SpotifyToken,
  spotifyUserSchema,
} from "@music-quiz/shared/schema/auth";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { ACCESS_TOKEN_KEY, SPOTIFY_STATE_KEY } from "@/utils/constants";
import { randomString } from "@/utils/random";

import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { Spotify } from "../spotify";
import { auth } from "./index";

export const authRouter = router({
  getSpotifyAuthUrl: publicProcedure
    .output(z.string())
    .query(async ({ ctx }) => {
      const state = randomString(32);
      ctx.res.cookie(SPOTIFY_STATE_KEY, state, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 1000, // 1 hour
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
    .output(spotifyUserSchema)
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

      const accessToken = auth.createToken<SpotifyToken>(token, {
        expiresIn: "1h",
      });

      ctx.res.cookie(ACCESS_TOKEN_KEY, accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 1000, // 1 hour
        partitioned: true,
      });

      const user = await Spotify.auth(token).getMe();

      return user;
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    ctx.res.clearCookie(ACCESS_TOKEN_KEY);
    return;
  }),

  currentUser: publicProcedure
    .output(spotifyUserSchema.nullable())
    .query(async ({ ctx }) => {
      if (!ctx.spotifyToken) {
        return null;
      }

      const user = await Spotify.auth(ctx.spotifyToken).getMe();

      return user;
    }),
});
