import React, { useState, useMemo, useEffect } from 'react';
import { Search, Edit, Plus, Trash2, Loader2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Material } from '@/types/material';
import { searchMaterials } from '@/services/materials';
import { EditMaterialModal } from './EditMaterialModal';
import { IncrementUnitsModal } from './IncrementUnitsModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { useDebounce } from '@/hooks/useDebounce';

interface MaterialsSearchModalProps {
  trigger?: React.ReactNode;
}

export function MaterialsSearchModal({ trigger }: MaterialsSearchModalProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [incrementingMaterial, setIncrementingMaterial] = useState<Material | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const debouncedQuery = useDebounce(searchQuery, 250);

  // Search materials query
  const {
    data: materials = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['searchMaterials', debouncedQuery],
    queryFn: () => debouncedQuery.trim() ? searchMaterials(debouncedQuery) : Promise.resolve([]),
    enabled: !!debouncedQuery.trim(),
    staleTime: 30000, // 30 seconds
  });

  const hasResults = materials.length > 0;
  const hasQuery = debouncedQuery.trim().length > 0;

  // Handle modal close
  const handleClose = () => {
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" />
              Consulta
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Consultar Materiais</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 flex-1 min-h-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Busque por SKU ou Descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>

            {/* Results */}
            <div className="flex-1 min-h-0 overflow-auto">
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Buscando materiais...</span>
                </div>
              )}

              {isError && (
                <div className="text-center py-8 text-red-600">
                  <p>Erro ao buscar materiais</p>
                  <p className="text-sm">{error?.message}</p>
                </div>
              )}

              {hasQuery && !isLoading && !hasResults && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum material encontrado</p>
                </div>
              )}

              {!hasQuery && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Digite para buscar materiais</p>
                </div>
              )}

              {hasResults && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {materials.length} resultado{materials.length !== 1 ? 's' : ''} encontrado{materials.length !== 1 ? 's' : ''}
                  </p>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                      {materials.map((material) => (
                        <div
                          key={material.SKU}
                          className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-muted/50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{material.Descrição}</h4>
                              <Badge variant="outline">{material.Categoria}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <span>SKU: {material.SKU}</span>
                              <span className="mx-2">•</span>
                              <span>Unidade: {material.Unidade}</span>
                              <span className="mx-2">•</span>
                              <span>Estoque: {material.Qtdd_Depósito}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingMaterial(material)}
                              aria-label={`Editar material ${material.SKU}`}
                            >
                              <Edit className="h-4 w-4" />
                              Editar
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIncrementingMaterial(material)}
                              aria-label={`Incrementar unidades do material ${material.SKU}`}
                            >
                              <Plus className="h-4 w-4" />
                              + Unidades
                            </Button>
                            
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeletingMaterial(material)}
                              aria-label={`Deletar material ${material.SKU}`}
                            >
                              <Trash2 className="h-4 w-4" />
                              Deletar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      {editingMaterial && (
        <EditMaterialModal
          material={editingMaterial}
          open={!!editingMaterial}
          onOpenChange={(open) => !open && setEditingMaterial(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['searchMaterials'] });
            setEditingMaterial(null);
          }}
        />
      )}

      {incrementingMaterial && (
        <IncrementUnitsModal
          material={incrementingMaterial}
          open={!!incrementingMaterial}
          onOpenChange={(open) => !open && setIncrementingMaterial(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['searchMaterials'] });
            setIncrementingMaterial(null);
          }}
        />
      )}

      {deletingMaterial && (
        <ConfirmDeleteModal
          material={deletingMaterial}
          open={!!deletingMaterial}
          onOpenChange={(open) => !open && setDeletingMaterial(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['searchMaterials'] });
            setDeletingMaterial(null);
          }}
        />
      )}
    </>
  );
}