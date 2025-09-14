import z from "zod/v4";

import { spotifyTokenSchema } from "../spotify/models";

export const tokenSchema = z
  .object({
    iat: z.number(),
    exp: z.number(),
  })
  .extend(spotifyTokenSchema.shape);

export type Token = z.infer<typeof tokenSchema>;
