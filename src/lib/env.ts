import { z } from "zod";

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional().default("https://script.google.com/macros/s/AKfycbyWCbb5anMtMVUFhD5WVRUa87kStYO5Lq2i7Pn2Et-tUcz6zVuTdKLzH2oCqk-3k2dZzw/exec"),
});

export const ENV = EnvSchema.parse(import.meta.env);