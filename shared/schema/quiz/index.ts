import { z } from "zod/v4";
import { zfd } from "zod-form-data";

export const quizValidationSchema = zfd.formData({
  id: zfd.numeric(z.number()).optional(),
  title: zfd.text(z.string().min(1, "Title is required")),
  image: zfd.file(),
  public: zfd.checkbox({ trueValue: "true" }),
});

export const quizFiltersSchema = z.object({
  q: z.string().optional(),
});

export type QuizFilterParams = z.infer<typeof quizFiltersSchema>;
