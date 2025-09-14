import { z } from "zod/v4";

export const commentValidationSchema = z.object({
  content: z.string().min(1, "Comment is required"),
});
