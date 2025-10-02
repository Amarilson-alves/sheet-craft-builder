import { z } from "zod";

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional().default("https://script.google.com/macros/s/AKfycbygrB42A8oeuI3A7G2CYVFJP7Ns_hRDSWRWumsQCe3mf8n4xIMG6-S2HNuCDe7j3mY9Sw/exec"),
});

export const ENV = EnvSchema.parse(import.meta.env);