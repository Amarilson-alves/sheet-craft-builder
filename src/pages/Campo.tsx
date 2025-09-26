import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MaterialSelector } from "@/components/MaterialSelector";
import { ArrowLeft, Save, Eraser, Building, User } from "lucide-react";
import { Link } from "react-router-dom";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyYZqR0fcxnlulAEpZenLmpy1LksliyZ8V7KvVoFdYAO77CaVzONRH-eVMyxcf4QDgrTw/exec";

interface SelectedMaterial {
  SKU: string;
  Descrição: string;
  Unidade: string;
  Categoria: string;
  quantidadeSelecionada: number;
}

const Campo = () => {
  const [formData, setFormData] = useState({
    tecnico: '',
    idObra: '',
    endereco: '',
    numero: '',
    complemento: '',
    tipoObra: '',
    obs: ''
  });
  const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterial[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.tecnico || !formData.endereco || !formData.numero || !formData.tipoObra) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
      });
      return;
    }

    if (selectedMaterials.length === 0) {
      toast({
        variant: "destructive",
        title: "Materiais necessários",
        description: "Selecione pelo menos um material",
      });
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formData,
        materiais: selectedMaterials.map(m => ({
          code: m.SKU,
          name: m.Descrição,
          unit: m.Unidade,
          quantity: m.quantidadeSelecionada
        }))
      };

      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'saveObra',
          data: payload
        })
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Obra salva com sucesso!",
        description: `ID da obra: ${result.obraId}`,
      });

      // Limpar formulário
      handleClear();

    } catch (error) {
      console.error('Erro ao salvar obra:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar a obra. Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setFormData({
      tecnico: '',
      idObra: '',
      endereco: '',
      numero: '',
      complemento: '',
      tipoObra: '',
      obs: ''
    });
    setSelectedMaterials([]);
    toast({
      title: "Formulário limpo",
      description: "Todos os dados foram removidos",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Building className="h-6 w-6" />
                  Cadastro de Materiais - Técnicos
                </h1>
                <p className="text-primary-foreground/80">Sistema para registro de obras e materiais utilizados</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Dados da Obra */}
        <Card className="animate-fadeIn">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados da Obra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tecnico">Nome Técnico *</Label>
                <Input
                  id="tecnico"
                  placeholder="Seu nome completo"
                  value={formData.tecnico}
                  onChange={(e) => handleInputChange('tecnico', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idObra">ID da Obra (opcional)</Label>
                <Input
                  id="idObra"
                  placeholder="Ex: OBRA-2023-001"
                  value={formData.idObra}
                  onChange={(e) => handleInputChange('idObra', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="endereco">Endereço *</Label>
                <Input
                  id="endereco"
                  placeholder="Ex: Rua das Flores"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero">Número *</Label>
                <Input
                  id="numero"
                  placeholder="Ex: 123"
                  value={formData.numero}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complemento">Complemento (opcional)</Label>
              <Input
                id="complemento"
                placeholder="Ex: Apt 101, Fundos, etc"
                value={formData.complemento}
                onChange={(e) => handleInputChange('complemento', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoObra">Tipo de Obra *</Label>
                <Select value={formData.tipoObra} onValueChange={(value) => handleInputChange('tipoObra', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alivio">Alívio</SelectItem>
                    <SelectItem value="Adequacao">Adequação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="obs">Observações (opcional)</Label>
                <Input
                  id="obs"
                  placeholder="Observações sobre a obra"
                  value={formData.obs}
                  onChange={(e) => handleInputChange('obs', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seleção de Materiais */}
        <div className="animate-slideUp">
          <MaterialSelector
            onMaterialsChange={setSelectedMaterials}
            scriptUrl={SCRIPT_URL}
          />
        </div>

        {/* Ações */}
        <Card className="animate-slideUp">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1"
                size="lg"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Obra
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={saving}
                size="lg"
                className="flex-1 sm:flex-none"
              >
                <Eraser className="h-4 w-4 mr-2" />
                Limpar Formulário
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Campo;