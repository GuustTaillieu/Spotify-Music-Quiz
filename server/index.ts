import * as trpcExpress from "@trpc/server/adapters/express";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { join } from "path";

import { authRouter } from "./features/auth/router";
import { notificationRouter } from "./features/notification/router";
import { questionRouter } from "./features/question/router";
import { quizRouter } from "./features/quiz/router";
import { userRouter } from "./features/user/router";
import { createContext, router } from "./trpc";
import { env } from "./utils/env";

const appRouter = router({
  auth: authRouter,
  quiz: quizRouter,
  questions: questionRouter,
  users: userRouter,
  notifications: notificationRouter,
});
export type AppRouter = typeof appRouter;

const app = express();

app.use(cookieParser());

app.use(
  cors({
    origin: env.CLIENT_BASE_URL,
    credentials: true,
  }),
);

app.use("/uploads", express.static(join(process.cwd(), "public", "uploads")));

app.use(
  "/",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.listen(env.SERVER_PORT);
