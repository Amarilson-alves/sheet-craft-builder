import { z } from "zod";

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional().default("https://script.google.com/macros/s/AKfycby2lliD-dWHYjt3CgxPUI7Iy5SsziQ5Azzd_nAQoeF8zFVdMmU7jG_Zej0l8aw6be0S/exec"),
});

export const ENV = EnvSchema.parse(import.meta.env);