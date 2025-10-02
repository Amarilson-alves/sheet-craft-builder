import { z } from "zod";

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional().default("https://script.google.com/macros/s/AKfycbyNaiJwXNC3nBZ6vYqFVwIR2odkVFsVvFuwsprQQSEaekcU6Ve1jxzNmyl6-yaglq5vEA/exec"),
});

export const ENV = EnvSchema.parse(import.meta.env);