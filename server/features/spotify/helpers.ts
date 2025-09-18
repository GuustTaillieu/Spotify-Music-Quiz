import { LocalUser } from "../user/models";
import { SpotifyToken } from "./models";

import { Spotify } from ".";

export async function getFullUser(spotifyToken: SpotifyToken, user: LocalUser) {
  const spotifyUser = await Spotify.auth(spotifyToken).getUserById(
    user.spotifyId,
  );
  return { ...spotifyUser, ...user };
}
