import { z } from "zod";

export const leadCaptureSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
});

export type LeadCaptureInput = z.infer<typeof leadCaptureSchema>;
