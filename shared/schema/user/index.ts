import { z } from "zod";

export const userFiltersSchema = z.object({
  q: z.string().optional(),
});

export type UserFilterParams = z.infer<typeof userFiltersSchema>;
