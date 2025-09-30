import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Material } from '@/types/material';
import { updateMaterial } from '@/services/materials';

const updateMaterialSchema = z.object({
  quantidade: z.number().min(0, 'Quantidade deve ser maior ou igual a zero'),
  descricao: z.string().min(1, 'Descrição é obrigatória').max(200, 'Descrição muito longa'),
  unidade: z.string().min(1, 'Unidade é obrigatória').max(10, 'Unidade muito longa'),
});

interface EditMaterialModalProps {
  material: Material;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditMaterialModal({ material, open, onOpenChange, onSuccess }: EditMaterialModalProps) {
  const [formData, setFormData] = useState({
    quantidade: material.Qtdd_Depósito,
    descricao: material.Descrição,
    unidade: material.Unidade,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: (data: { quantidade: number; descricao: string; unidade: string }) =>
      updateMaterial(material.SKU, data),
    onSuccess: () => {
      toast({
        title: 'Material atualizado',
        description: 'O material foi atualizado com sucesso.',
      });
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o material.',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = updateMaterialSchema.parse(formData);
      setErrors({});
      updateMutation.mutate({
        quantidade: validatedData.quantidade,
        descricao: validatedData.descricao,
        unidade: validatedData.unidade,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Material</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">SKU</Label>
            <div className="mt-1 px-3 py-2 bg-muted rounded-md text-sm">
              {material.SKU}
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              className={errors.descricao ? 'border-red-500' : ''}
            />
            {errors.descricao && (
              <p className="text-sm text-red-500 mt-1">{errors.descricao}</p>
            )}
          </div>

          <div>
            <Label htmlFor="unidade">Unidade</Label>
            <Input
              id="unidade"
              value={formData.unidade}
              onChange={(e) => handleInputChange('unidade', e.target.value)}
              placeholder="Ex: UN, M, KG"
              className={errors.unidade ? 'border-red-500' : ''}
            />
            {errors.unidade && (
              <p className="text-sm text-red-500 mt-1">{errors.unidade}</p>
            )}
          </div>

          <div>
            <Label htmlFor="quantidade">Quantidade em Estoque</Label>
            <Input
              id="quantidade"
              type="number"
              min="0"
              step="1"
              value={formData.quantidade}
              onChange={(e) => handleInputChange('quantidade', parseInt(e.target.value) || 0)}
              className={errors.quantidade ? 'border-red-500' : ''}
            />
            {errors.quantidade && (
              <p className="text-sm text-red-500 mt-1">{errors.quantidade}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}