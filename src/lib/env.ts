import { z } from "zod";

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional().default("https://script.google.com/macros/s/AKfycbwj1GksvkEVfYOzhC9GjQkXvD7zjJXPRoNzCP9DQts9OfLShqLLwz1cHZViArQ1T3E3Zg/exec"),
});

export const ENV = EnvSchema.parse(import.meta.env);