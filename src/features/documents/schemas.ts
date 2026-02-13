import { z } from "zod/v4";

export const UploadDocumentSchema = z.object({
  name: z
    .string()
    .min(1, "Name must be at least 1 character")
    .max(255, "Name must be at most 255 characters"),
  content: z
    .string()
    .min(1, "Content must not be empty")
    .max(1_000_000, "Content must be at most 1,000,000 characters"),
  mimeType: z.string().optional(),
});

export type UploadDocumentInput = z.infer<typeof UploadDocumentSchema>;
