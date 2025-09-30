import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { AlertTriangle } from 'lucide-react';
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
import { deleteMaterial } from '@/services/materials';

const deleteSchema = z.object({
  confirmation: z.string().min(1, 'Confirmação é obrigatória'),
  motivo: z.string().max(200, 'Motivo muito longo').optional(),
});

interface ConfirmDeleteModalProps {
  material: Material;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ConfirmDeleteModal({ material, open, onOpenChange, onSuccess }: ConfirmDeleteModalProps) {
  const [formData, setFormData] = useState({
    confirmation: '',
    motivo: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: (motivo?: string) => deleteMaterial(material.SKU, motivo),
    onSuccess: () => {
      toast({
        title: 'Material excluído',
        description: `Material ${material.SKU} foi removido com sucesso.`,
      });
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({ confirmation: '', motivo: '' });
      setErrors({});
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Não foi possível excluir o material.',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = deleteSchema.parse(formData);
      
      // Check if confirmation matches SKU or "DELETAR"
      const confirmText = validatedData.confirmation.trim().toUpperCase();
      const expectedSku = material.SKU.toUpperCase();
      
      if (confirmText !== expectedSku && confirmText !== 'DELETAR') {
        setErrors({
          confirmation: `Digite "${material.SKU}" ou "DELETAR" para confirmar`,
        });
        return;
      }
      
      setErrors({});
      deleteMutation.mutate(validatedData.motivo);
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isConfirmationValid = () => {
    const confirmText = formData.confirmation.trim().toUpperCase();
    const expectedSku = material.SKU.toUpperCase();
    return confirmText === expectedSku || confirmText === 'DELETAR';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Exclusão
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm">
            <div className="font-medium text-red-800">
              Você está prestes a excluir este material:
            </div>
            <div className="mt-2 space-y-1 text-red-700">
              <div><strong>SKU:</strong> {material.SKU}</div>
              <div><strong>Descrição:</strong> {material.Descrição}</div>
              <div><strong>Estoque:</strong> {material.Qtdd_Depósito} {material.Unidade}</div>
            </div>
          </div>
        </div>

        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Atenção:</strong> Esta ação não pode ser desfeita. O material será removido permanentemente do sistema.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="confirmation">
              Para confirmar, digite o SKU "{material.SKU}" ou "DELETAR"*
            </Label>
            <Input
              id="confirmation"
              value={formData.confirmation}
              onChange={(e) => handleInputChange('confirmation', e.target.value)}
              placeholder={`Digite ${material.SKU} ou DELETAR`}
              className={errors.confirmation ? 'border-red-500' : ''}
            />
            {errors.confirmation && (
              <p className="text-sm text-red-500 mt-1">{errors.confirmation}</p>
            )}
          </div>

          <div>
            <Label htmlFor="motivo">Motivo da Exclusão (opcional)</Label>
            <Textarea
              id="motivo"
              value={formData.motivo}
              onChange={(e) => handleInputChange('motivo', e.target.value)}
              placeholder="Descreva o motivo da exclusão..."
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
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={deleteMutation.isPending || !isConfirmationValid()}
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}