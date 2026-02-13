import { z } from "zod/v4";

export const CreateShareSchema = z.object({
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

export type CreateShareInput = z.infer<typeof CreateShareSchema>;
