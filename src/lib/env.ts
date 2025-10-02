import { z } from "zod";

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional().default("https://script.google.com/macros/s/AKfycbwe5GMy0ZJhhbTYrYn4zphpE0TTRq_Zxw8MVVafkYbRX8cA6hBDxo252TmNfuBLJi8B6Q/exec"),
});

export const ENV = EnvSchema.parse(import.meta.env);