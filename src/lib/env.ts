import { z } from "zod";

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional().default("https://script.google.com/macros/s/AKfycbyYZqR0fcxnlulAEpZenLmpy1LksliyZ8V7KvVoFdYAO77CaVzONRH-eVMyxcf4QDgrTw/exec"),
});

export const ENV = EnvSchema.parse(import.meta.env);