import { z } from "zod";

export const NotificationDTOSchema = z.object({
  to: z.string().min(1, "Recipient is required"),

  subject: z.string().min(1, "Subject is required"),

  templateId: z.string().min(1, "TemplateId is required"),

  params: z.record(z.any()), // dynamic key-value pairs
});

export type NotificationTypes = z.infer<typeof NotificationDTOSchema>;