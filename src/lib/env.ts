import { z } from "zod";

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional().default("https://script.google.com/macros/s/AKfycbzW4RZRti0QjSZ8m5o_YUjVFG1v9Yyv7RkZS2nJiJJkphDqpEovPQfkddG5gsWxG-3_Fw/exec"),
});

export const ENV = EnvSchema.parse(import.meta.env);