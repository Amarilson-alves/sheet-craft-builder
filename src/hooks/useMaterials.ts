import { useQuery } from "@tanstack/react-query";
import { getMaterials } from "@/services/materials";

export function useMaterials() {
  return useQuery({ 
    queryKey: ["materials"], 
    queryFn: getMaterials, 
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
}