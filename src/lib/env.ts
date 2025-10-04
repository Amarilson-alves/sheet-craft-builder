import { z } from "zod";

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional().default("https://script.google.com/macros/s/AKfycbxq2KdsV-Fmqx8vmmT7PjbyF-aN47CEnZszQD9p4Bhg-e8deD_10Nrd9CCFZUHKQEcyfA/exec"),
});

export const ENV = EnvSchema.parse(import.meta.env);