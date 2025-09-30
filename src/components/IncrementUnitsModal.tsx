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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Material } from '@/types/material';
import { incrementMaterial } from '@/services/materials';

const incrementSchema = z.object({
  delta: z.number().min(1, 'Quantidade deve ser maior que zero'),
  motivo: z.string().max(200, 'Motivo muito longo').optional(),
});

interface IncrementUnitsModalProps {
  material: Material;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function IncrementUnitsModal({ material, open, onOpenChange, onSuccess }: IncrementUnitsModalProps) {
  const [formData, setFormData] = useState({
    delta: 1,
    motivo: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { toast } = useToast();

  const incrementMutation = useMutation({
    mutationFn: (data: { delta: number; motivo?: string }) =>
      incrementMaterial(material.SKU, data.delta, data.motivo),
    onSuccess: (response) => {
      toast({
        title: 'Unidades adicionadas',
        description: `Nova quantidade: ${response.newQty} ${material.Unidade}`,
      });
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({ delta: 1, motivo: '' });
      setErrors({});
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Não foi possível adicionar as unidades.',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = incrementSchema.parse(formData);
      setErrors({});
      incrementMutation.mutate({
        delta: validatedData.delta,
        motivo: validatedData.motivo,
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

  const newQuantity = material.Qtdd_Depósito + formData.delta;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Unidades</DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="text-sm">
            <div className="font-medium">{material.Descrição}</div>
            <div className="text-muted-foreground">
              SKU: {material.SKU} • Estoque atual: {material.Qtdd_Depósito} {material.Unidade}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="delta">Quantidade a Adicionar*</Label>
            <Input
              id="delta"
              type="number"
              min="1"
              step="1"
              value={formData.delta}
              onChange={(e) => handleInputChange('delta', parseInt(e.target.value) || 1)}
              className={errors.delta ? 'border-red-500' : ''}
            />
            {errors.delta && (
              <p className="text-sm text-red-500 mt-1">{errors.delta}</p>
            )}
            {formData.delta > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Nova quantidade: {newQuantity} {material.Unidade}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="motivo">Observação (opcional)</Label>
            <Textarea
              id="motivo"
              value={formData.motivo}
              onChange={(e) => handleInputChange('motivo', e.target.value)}
              placeholder="Motivo do incremento..."
              rows={3}
              className={errors.motivo ? 'border-red-500' : ''}
            />
            {errors.motivo && (
              <p className="text-sm text-red-500 mt-1">{errors.motivo}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={incrementMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={incrementMutation.isPending}>
              {incrementMutation.isPending ? 'Adicionando...' : 'Adicionar Unidades'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}