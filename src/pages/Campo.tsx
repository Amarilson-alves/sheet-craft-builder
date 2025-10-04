import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MaterialsButtonGrid } from "@/components/MaterialsButtonGrid";
import { useMaterials } from "@/hooks/useMaterials";
import { Save, Eraser, Building, User, Package, Minus, Plus, Filter } from "lucide-react";
import { gasPost } from "@/lib/gasClient";
import type { Material, SelectedMaterial } from "@/types/material";
import { BackButton } from "@/components/BackButton";
import { sanitizeObject, sanitizeNumber } from "@/utils/sanitize";
import { saveObraLimiter } from "@/utils/rateLimit";
import { validators, validateForm } from "@/utils/validators";

type FilterType = 'none' | 'interno' | 'externo' | 'todos';

const Campo = () => {
  const [formData, setFormData] = useState({
    tecnico: '',
    idObra: '',
    endereco: '',
    numero: '',
    complemento: '',
    uf: '',
    tipoObra: '',
    obs: ''
  });
  const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterial[]>([]);
  const [filter, setFilter] = useState<FilterType>('none');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { data: materials, isLoading, isError } = useMaterials();

  // Filtrar materiais com base no filtro selecionado
  const filteredMaterials = React.useMemo(() => {
    if (filter === 'none' || !materials) return [];
    if (filter === 'todos') return materials;
    return materials.filter(m => m.Categoria.toLowerCase() === filter);
  }, [materials, filter]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validação com validators
    const { isValid, errors } = validateForm(formData, {
      tecnico: [validators.required, validators.minLength(3), validators.maxLength(100)],
      endereco: [validators.required, validators.maxLength(200)],
      numero: [validators.required, validators.maxLength(10)],
      uf: [validators.required],
      tipoObra: [validators.required],
      idObra: [validators.maxLength(50)],
      complemento: [validators.maxLength(100)],
      obs: [validators.maxLength(500)],
    });

    if (!isValid) {
      const firstError = Object.values(errors)[0];
      toast({
        variant: "destructive",
        title: "Campos inválidos",
        description: firstError || "Verifique os campos obrigatórios",
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

    // Rate limiting
    if (!saveObraLimiter.isAllowed('saveObra')) {
      toast({
        variant: "destructive",
        title: "Muitas tentativas",
        description: "Aguarde um momento antes de tentar novamente",
      });
      return;
    }

    setSaving(true);

    try {
      // Preparar dados para o GAS com os nomes exatos da planilha
      const obraPayload = {
        obra_id: formData.idObra || "",
        tecnico: formData.tecnico,
        uf: formData.uf,
        endereco: formData.endereco,
        numero: sanitizeNumber(formData.numero),
        complemento: formData.complemento || "",
        Tipo_obra: formData.tipoObra,
        obs: formData.obs || "",
        data: new Date().toISOString().slice(0, 10),
        status: "Nova",
        materiais: selectedMaterials.map(m => ({
          code: m.SKU,
          name: m.Descrição,
          unit: m.Unidade,
          quantity: sanitizeNumber(m.quantidadeSelecionada)
        }))
      };

      const result = await gasPost('saveObra', obraPayload);

      console.log('Resposta do saveObra:', result);

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Obra salva com sucesso!",
        description: `ID da obra: ${result.obra_id || result.obraId || 'Gerado automaticamente'}`,
      });

      // Limpar formulário somente após sucesso
      setFormData({
        tecnico: '',
        idObra: '',
        endereco: '',
        numero: '',
        complemento: '',
        uf: '',
        tipoObra: '',
        obs: ''
      });
      setSelectedMaterials([]);
      setFilter('none');

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
      uf: '',
      tipoObra: '',
      obs: ''
    });
    setSelectedMaterials([]);
    setFilter('none');
    toast({
      title: "Formulário limpo",
      description: "Todos os dados foram removidos",
    });
  };

  const handleMaterialSelect = (material: Material) => {
    const existing = selectedMaterials.find(m => m.SKU === material.SKU);
    if (existing) {
      setSelectedMaterials(prev =>
        prev.map(m =>
          m.SKU === material.SKU
            ? { ...m, quantidadeSelecionada: m.quantidadeSelecionada + 1 }
            : m
        )
      );
    } else {
      setSelectedMaterials(prev => [
        ...prev,
        { ...material, quantidadeSelecionada: 1 }
      ]);
    }
    
    toast({
      title: "Material adicionado",
      description: `${material.Descrição} foi adicionado à lista`,
    });
  };

  const updateQuantity = (sku: string, quantity: number) => {
    const sanitizedQty = sanitizeNumber(quantity);
    
    if (sanitizedQty <= 0) {
      setSelectedMaterials(prev => prev.filter(m => m.SKU !== sku));
    } else {
      setSelectedMaterials(prev =>
        prev.map(m =>
          m.SKU === sku ? { ...m, quantidadeSelecionada: sanitizedQty } : m
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <BackButton fallbackPath="/" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
                  <Building className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                  <span className="truncate">Campo - Técnicos</span>
                </h1>
                <p className="text-primary-foreground/80 text-xs sm:text-sm hidden sm:block">Sistema para registro de obras e materiais utilizados</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <Label htmlFor="uf">UF *</Label>
                <Select value={formData.uf} onValueChange={(value) => handleInputChange('uf', value)}>
                  <SelectTrigger id="uf" aria-label="UF">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PR">PR</SelectItem>
                    <SelectItem value="PRI">PRI</SelectItem>
                    <SelectItem value="SC">SC</SelectItem>
                    <SelectItem value="RS">RS</SelectItem>
                  </SelectContent>
                </Select>
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
        <Card className="animate-slideUp">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Selecionar Materiais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filtros */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtrar por categoria:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filter === 'interno' ? 'default' : 'outline'}
                  onClick={() => setFilter('interno')}
                  aria-pressed={filter === 'interno'}
                >
                  Interno
                </Button>
                <Button
                  variant={filter === 'externo' ? 'default' : 'outline'}
                  onClick={() => setFilter('externo')}
                  aria-pressed={filter === 'externo'}
                >
                  Externo
                </Button>
                <Button
                  variant={filter === 'todos' ? 'default' : 'outline'}
                  onClick={() => setFilter('todos')}
                  aria-pressed={filter === 'todos'}
                >
                  Todos
                </Button>
              </div>
            </div>

            {/* Materiais */}
            {isError ? (
              <div className="text-center py-8 text-destructive">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Erro ao carregar materiais. Tente novamente.</p>
              </div>
            ) : filter === 'none' ? (
              <div className="text-center py-8 text-muted-foreground">
                <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um filtro para visualizar materiais (Interno, Externo ou Todos)</p>
              </div>
            ) : (
              <MaterialsButtonGrid
                materials={filteredMaterials}
                onSelect={handleMaterialSelect}
                loading={isLoading}
                selectedMaterials={selectedMaterials}
              />
            )}
          </CardContent>
        </Card>

        {/* Materiais Selecionados */}
        {selectedMaterials.length > 0 && (
          <Card className="animate-slideUp">
            <CardHeader>
              <CardTitle>Materiais Selecionados ({selectedMaterials.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedMaterials.map((material) => (
                  <div
                    key={material.SKU}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{material.SKU}</Badge>
                        <Badge variant={material.Categoria === 'Interno' ? 'default' : 'outline'}>
                          {material.Categoria}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm">{material.Descrição}</p>
                      <p className="text-xs text-muted-foreground">
                        Unidade: {material.Unidade}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(material.SKU, material.quantidadeSelecionada - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={material.quantidadeSelecionada}
                        onChange={(e) => updateQuantity(material.SKU, parseInt(e.target.value) || 0)}
                        className="w-20 text-center"
                        min="0"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(material.SKU, material.quantidadeSelecionada + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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