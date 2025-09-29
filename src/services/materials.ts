import { ENV } from "@/lib/env";
import { http } from "@/lib/http";
import type { Material } from "@/types/material";

export async function getMaterials(): Promise<Material[]> {
  const url = `${ENV.VITE_API_BASE_URL}?action=getMaterials`;
  const response = await http<{ materials?: Material[]; error?: string }>(url);
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  return response.materials || [];
}