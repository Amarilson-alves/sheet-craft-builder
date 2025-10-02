import { z } from "zod";

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional().default("https://script.google.com/macros/s/AKfycbykpQ2YFbItUInk56wGJOC56a7Rcq-soXjpA4WlJTbvhom9eSM5rGbIzp0bucg-yczBVQ/exec"),
});

export const ENV = EnvSchema.parse(import.meta.env);