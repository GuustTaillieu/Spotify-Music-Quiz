import { TRPCError } from "@trpc/server";

import { env } from "@/utils/env";
import { isTrpcError } from "@/utils/trpc";

import { SpotifyToken, SpotifyUser } from "./models";

export abstract class Spotify {
  static auth(spotifyToken: SpotifyToken) {
    return new SpotifyWithAuth(spotifyToken);
  }

  static getAuthUrl(state: string) {
    const url = new URL(env.SPOTIFY_AUTH_URL);
    url.searchParams.append("response_type", "code");
    url.searchParams.append("client_id", env.SPOTIFY_CLIENT_ID);
    url.searchParams.append("redirect_uri", env.SPOTIFY_REDIRECT_URI);
    url.searchParams.append("scope", env.SPOTIFY_SCOPE);
    url.searchParams.append("state", state);
    return url.toString();
  }

  static async getToken(code: string): Promise<SpotifyToken> {
    const authString = btoa(
      `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`,
    );

    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: this.getBodyForAuth(code),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to parse error, but don't fail if it's not JSON
        console.error(
          "Spotify token request failed:",
          response.status,
          errorData,
        );
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Failed to get Spotify token: ${errorData.error_description || response.statusText}`,
        });
      }

      return {
        ...(await response.json()),
        issued_at: Date.now(),
      } as SpotifyToken;
    } catch (error) {
      console.error("Error fetching Spotify token:", error);
      // Re-throw as TRPCError if it's not already one
      if (isTrpcError(error)) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while getting Spotify token.",
        cause: error,
      });
    }
  }

  private static getBodyForAuth(code: string): string {
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", env.SPOTIFY_REDIRECT_URI); // This MUST match the one used in the initial authorization request
    return params.toString();
  }
}

class SpotifyWithAuth {
  private spotifyToken: SpotifyToken;

  constructor(accessToken: SpotifyToken) {
    if (!accessToken) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No access token",
      });
    }
    this.spotifyToken = accessToken;
  }

  async getMe(): Promise<SpotifyUser> {
    const response = await fetch(`https://api.spotify.com/v1/me`, {
      headers: {
        Authorization: `Bearer ${this.spotifyToken.access_token}`,
      },
    });

    if (!response.ok) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid spotify token",
      });
    }

    return response.json();
  }

  async refreshToken(): Promise<SpotifyToken> {
    const refreshToken = this.spotifyToken.refresh_token;
    const authString = btoa(
      `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`,
    );

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authString}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: env.SPOTIFY_CLIENT_ID,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Try to parse error, but don't fail if it's not JSON
      console.error(
        "Spotify token request failed:",
        response.status,
        errorData,
      );
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Failed to get Spotify token: ${errorData.error_description || response.statusText}`,
      });
    }

    const refreshedToken = (await response.json()) as SpotifyToken;

    if (!refreshedToken.refresh_token) {
      return {
        ...refreshedToken,
        refresh_token: refreshToken,
        issued_at: Date.now(),
      } as SpotifyToken;
    }
    return refreshedToken;
  }
}
