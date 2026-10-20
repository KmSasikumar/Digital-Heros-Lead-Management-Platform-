import { z } from "zod";

export const leadCaptureSchema = z.object({
  // Trim first: a whitespace-only name used to satisfy min(1) and be stored.
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
});

export type LeadCaptureInput = z.infer<typeof leadCaptureSchema>;
