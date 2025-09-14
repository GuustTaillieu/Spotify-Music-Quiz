import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../../utils/env";

const SALT_ROUNDS = 12;

export const auth = {
  hashPassword: (password: string) => {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  verifyPassword: (password: string, hash: string) => {
    return bcrypt.compare(password, hash);
  },

  createToken: <T extends {}>(payload: T, options: jwt.SignOptions) => {
    return jwt.sign(payload, env.AUTH_SECRET, options);
  },

  verifyToken: <T extends {} | null>(
    token: string,
    options?: jwt.VerifyOptions,
  ) => {
    try {
      return jwt.verify(token, env.AUTH_SECRET, options) as T;
    } catch {
      return null;
    }
  },

  isTokenExpired: async ({ exp }: { exp: number }) => {
    console.log(new Date(exp).toISOString(), new Date().toISOString());
    return exp > Date.now() / 1000 + 60;
  },
};
