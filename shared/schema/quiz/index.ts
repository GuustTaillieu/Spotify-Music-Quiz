import { z } from "zod/v4";
import { zfd } from "zod-form-data";

export const quizValidationSchema = zfd.formData({
  id: zfd.numeric(z.number()).optional(),
  title: zfd.text(z.string().min(1, "Title is required")),
  image: zfd.file().optional(),
  public: zfd.checkbox().optional(),
});

export const quizFiltersSchema = z.object({
  q: z.string().optional(),
});

export type ExperienceFilterParams = z.infer<typeof quizFiltersSchema>;
