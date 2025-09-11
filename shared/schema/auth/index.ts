import z from "zod";

export const spotifyUserSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  email: z.string(),
  images: z.array(
    z.object({
      url: z.string(),
      height: z.number(),
      width: z.number(),
    }),
  ),
});

export type SpotifyUser = z.infer<typeof spotifyUserSchema>;

export const spotifyTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  scope: z.string(),
  expires_in: z.number(),
  iat: z.number(),
  refresh_token: z.string(),
});

export type SpotifyToken = z.infer<typeof spotifyTokenSchema>;
