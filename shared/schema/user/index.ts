import { z } from "zod/v4";

export const userFiltersSchema = z.object({
  q: z.string().optional(),
});

export type UserFilterParams = z.infer<typeof userFiltersSchema>;
