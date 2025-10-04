import { z } from "zod";

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional().default("https://script.google.com/macros/s/AKfycbxkwPuO7uKHWpY5YrsQ5WSwn6upWDxaP1D9fzQZVkTytgZOBbZE_iLro9f2xKGb53fdZw/exec"),
});

export const ENV = EnvSchema.parse(import.meta.env);