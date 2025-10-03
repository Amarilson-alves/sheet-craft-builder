import { z } from "zod";

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional().default("https://script.google.com/macros/s/AKfycbwdiDEGtTFPX2GyHaGzo-sBl45hst1mzViWgOWsbZOtfLGXb3gTbogYOmFpUROSD_3bgA/exec"),
});

export const ENV = EnvSchema.parse(import.meta.env);