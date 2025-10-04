import { z } from "zod";

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional().default("https://script.google.com/macros/s/AKfycbyyBv7ZlyV69BI1SyevQ_3Rybr-Ozqj1LKSNctavrbrG4FjMJMOcZRhukQD_J484Y5HOg/exec"),
});

export const ENV = EnvSchema.parse(import.meta.env);