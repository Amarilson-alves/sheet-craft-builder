import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Package, Minus, Plus } from "lucide-react";

interface Material {
  SKU: string;
  Descrição: string;
  Unidade: string;
  Qtdd_Depósito: number;
  Categoria: 'Interno' | 'Externo';
}

interface SelectedMaterial extends Material {
  quantidadeSelecionada: number;
}

interface MaterialSelectorProps {
  onMaterialsChange: (materials: SelectedMaterial[]) => void;
  scriptUrl: string;
}

export const MaterialSelector: React.FC<MaterialSelectorProps> = ({ 
  onMaterialsChange, 
  scriptUrl 
}) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [activeCategory, setActiveCategory] = useState<'Interno' | 'Externo' | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMaterials();
  }, [scriptUrl]);

  useEffect(() => {
    filterMaterials();
  }, [materials, activeCategory, searchTerm]);

  useEffect(() => {
    onMaterialsChange(selectedMaterials);
  }, [selectedMaterials, onMaterialsChange]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${scriptUrl}?action=getMaterials`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setMaterials(data.materials || []);
      toast({
        title: "Materiais carregados",
        description: `${data.materials?.length || 0} materiais disponíveis`,
      });
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os materiais",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = materials;
    
    if (activeCategory !== 'all') {
      filtered = filtered.filter(material => material.Categoria === activeCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.Descrição.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.SKU.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredMaterials(filtered);
  };

  const addMaterial = (material: Material) => {
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
  };

  const updateQuantity = (sku: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedMaterials(prev => prev.filter(m => m.SKU !== sku));
    } else {
      setSelectedMaterials(prev =>
        prev.map(m =>
          m.SKU === sku ? { ...m, quantidadeSelecionada: quantity } : m
        )
      );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Carregando materiais...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seleção de Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Selecionar Materiais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Botões de Categoria */}
          <div className="flex gap-2">
            <Button
              variant={activeCategory === 'Interno' ? 'default' : 'outline'}
              onClick={() => setActiveCategory('Interno')}
              className="flex-1"
            >
              Material Interno
            </Button>
            <Button
              variant={activeCategory === 'Externo' ? 'default' : 'outline'}
              onClick={() => setActiveCategory('Externo')}
              className="flex-1"
            >
              Material Externo
            </Button>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar material..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Lista de Materiais Disponíveis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
            {filteredMaterials.map((material, index) => (
              <Button
                key={`${material.SKU}-${index}`}
                variant="material"
                className="p-4 h-auto flex-col items-start text-left justify-start"
                onClick={() => addMaterial(material)}
              >
                <div className="w-full">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {material.SKU}
                    </Badge>
                    <Badge variant={material.Categoria === 'Interno' ? 'default' : 'outline'}>
                      {material.Categoria}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm mb-1">{material.Descrição}</p>
                  <p className="text-xs text-muted-foreground">
                    Unidade: {material.Unidade} | Estoque: {material.Qtdd_Depósito}
                  </p>
                </div>
              </Button>
            ))}
          </div>

          {filteredMaterials.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum material encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Materiais Selecionados */}
      {selectedMaterials.length > 0 && (
        <Card>
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
    </div>
  );
};