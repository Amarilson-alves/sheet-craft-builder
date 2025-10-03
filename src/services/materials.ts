import { gasGet } from "@/lib/gasClient";
import { postToGAS } from "@/lib/postToGAS";
import type { Material } from "@/types/material";
import { queryLimiter } from "@/utils/rateLimit";

const GAS_URL = "https://script.google.com/macros/s/AKfycbyKcmCNAIfMQyN_UdoHJ_ACCto6LN4IujIBI4r20ANXm9qRPf2GILVLNVAb4NxZ47inQw/exec";

export async function getMaterials(): Promise<Material[]> {
  if (!queryLimiter.isAllowed('getMaterials')) {
    throw new Error('Muitas requisições. Aguarde um momento.');
  }
  
  const response = await gasGet({ action: 'getMaterials' });
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  return response.materials || [];
}

export async function searchMaterials(query: string): Promise<Material[]> {
  // Backend doesn't support searchMaterials action, so we get all and filter client-side
  const allMaterials = await getMaterials();
  
  const normalizedQuery = query.trim().toLowerCase();
  
  if (!normalizedQuery) {
    return [];
  }
  
  // Filter by SKU or Description (case-insensitive, contains match)
  const filtered = allMaterials.filter((material) => {
    const sku = (material.SKU || '').toLowerCase();
    const desc = (material.Descrição || '').toLowerCase();
    
    return sku.includes(normalizedQuery) || desc.includes(normalizedQuery);
  });
  
  // Limit to 50 results for performance
  return filtered.slice(0, 50);
}

export async function updateMaterial(
  sku: string, 
  data: { quantidade: number; descricao: string; unidade: string }
): Promise<{ ok: boolean }> {
  const response = await postToGAS(GAS_URL, 'updateMaterial', {
    sku,
    quantidade: data.quantidade,
    descricao: data.descricao,
    unidade: data.unidade
  });
  
  if (response?.error) {
    throw new Error(response.error);
  }
  
  return { ok: response?.ok ?? true };
}

export async function incrementMaterial(
  sku: string, 
  delta: number, 
  motivo?: string
): Promise<{ ok: boolean; newQty: number }> {
  const response = await postToGAS(GAS_URL, 'incrementMaterial', { 
    sku, 
    delta, 
    motivo: motivo || '' 
  });
  
  if (response?.error) {
    throw new Error(response.error);
  }
  
  return { ok: response?.ok ?? true, newQty: response?.newQty ?? 0 };
}

export async function deleteMaterial(sku: string, motivo?: string): Promise<{ ok: boolean }> {
  const response = await postToGAS(GAS_URL, 'deleteMaterial', { 
    sku, 
    motivo: motivo || '' 
  });
  
  if (response?.error) {
    throw new Error(response.error);
  }
  
  return { ok: response?.ok ?? true };
}