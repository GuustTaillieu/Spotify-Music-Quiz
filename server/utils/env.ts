import { z } from "zod/v4";

import "dotenv/config";

const envSchema = z.object({
  CLIENT_BASE_URL: z.string(),
  CLIENT_PORT: z.string(),
  SERVER_BASE_URL: z.string(),
  SERVER_PORT: z.string(),
  AUTH_SECRET: z.string(),
  SPOTIFY_CLIENT_ID: z.string(),
  SPOTIFY_CLIENT_SECRET: z.string(),
  SPOTIFY_SCOPE: z.string(),
  SPOTIFY_REDIRECT_URI: z.string(),
  SPOTIFY_AUTH_URL: z.string(),
});
export const env = envSchema.parse(process.env);
