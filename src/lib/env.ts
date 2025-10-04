import { z } from "zod";

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional().default("https://script.google.com/macros/s/AKfycbxFrSfmg16RM7ZGrpQLrxq13nWS25Yx93FkpW8y0daglCZqv3XgcSMGyWGTp8yJHje8g/exec"),
});

export const ENV = EnvSchema.parse(import.meta.env);