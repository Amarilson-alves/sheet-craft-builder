import { z } from "zod";

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional().default("https://script.google.com/macros/s/AKfycbxTuHDio5Rd4kIY9WeyFdtTJldRAEMfZQZ1xj7x8yJwZdysTyP75XodUyuEOS0fW7aLoA/exec"),
});

export const ENV = EnvSchema.parse(import.meta.env);