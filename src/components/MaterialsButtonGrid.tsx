import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Material, SelectedMaterial } from '@/types/material';
import { Package, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MaterialsButtonGridProps {
  materials: Material[];
  onSelect: (material: Material) => void;
  loading?: boolean;
  selectedMaterials?: SelectedMaterial[];
}

export function MaterialsButtonGrid({ materials, onSelect, loading, selectedMaterials = [] }: MaterialsButtonGridProps) {
  const isSelected = (sku: string) => selectedMaterials.some(m => m.SKU === sku);
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando materiais...</span>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum material disponível</p>
      </div>
    );
  }

  // Agrupar por categoria
  const internos = materials.filter(m => m.Categoria === 'Interno');
  const externos = materials.filter(m => m.Categoria === 'Externo');

  return (
    <div className="space-y-6">
      {/* Materiais Internos */}
      {internos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="default">Interno</Badge>
            <span className="text-sm text-muted-foreground">
              {internos.length} {internos.length === 1 ? 'material' : 'materiais'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {internos.map((material) => {
              const selected = isSelected(material.SKU);
              return (
                <Button
                  key={material.SKU}
                  variant={selected ? 'default' : 'outline'}
                  className="h-auto py-3 px-4 flex flex-col items-start justify-start text-left relative"
                  onClick={() => onSelect(material)}
                  aria-pressed={selected}
                >
                  {selected && (
                    <Check className="absolute top-2 right-2 h-4 w-4 text-primary-foreground" />
                  )}
                  <div className="font-medium text-sm mb-1 pr-6">{material.Descrição}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {material.SKU}
                    </Badge>
                    <span>•</span>
                    <span>{material.Unidade}</span>
                    {material.Qtdd_Depósito > 0 && (
                      <>
                        <span>•</span>
                        <span>Estoque: {material.Qtdd_Depósito}</span>
                      </>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Materiais Externos */}
      {externos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Externo</Badge>
            <span className="text-sm text-muted-foreground">
              {externos.length} {externos.length === 1 ? 'material' : 'materiais'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {externos.map((material) => {
              const selected = isSelected(material.SKU);
              return (
                <Button
                  key={material.SKU}
                  variant={selected ? 'default' : 'outline'}
                  className="h-auto py-3 px-4 flex flex-col items-start justify-start text-left relative"
                  onClick={() => onSelect(material)}
                  aria-pressed={selected}
                >
                  {selected && (
                    <Check className="absolute top-2 right-2 h-4 w-4 text-primary-foreground" />
                  )}
                  <div className="font-medium text-sm mb-1 pr-6">{material.Descrição}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {material.SKU}
                    </Badge>
                    <span>•</span>
                    <span>{material.Unidade}</span>
                    {material.Qtdd_Depósito > 0 && (
                      <>
                        <span>•</span>
                        <span>Estoque: {material.Qtdd_Depósito}</span>
                      </>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
