import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Search, 
  Download, 
  Trash2, 
  Plus, 
  Settings, 
  FileSpreadsheet,
  Calendar,
  User,
  Building,
  Package
} from "lucide-react";
import { Link } from "react-router-dom";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyYZqR0fcxnlulAEpZenLmpy1LksliyZ8V7KvVoFdYAO77CaVzONRH-eVMyxcf4QDgrTw/exec";

interface Obra {
  'ID Obra': string;
  'Técnico': string;
  'Endereço': string;
  'Número': string;
  'Complemento': string;
  'Tipo_Obra': string;
  'Observacoes': string;
  'Data': string;
  'Status': string;
  materiais: Array<{
    code: string;
    name: string;
    unit: string;
    quantity: number;
  }>;
}

interface Material {
  SKU: string;
  Descrição: string;
  Unidade: string;
  Qtdd_Depósito: number;
  Categoria: string;
}

const Interno = () => {
  const [activeTab, setActiveTab] = useState("consultar");
  const [obras, setObras] = useState<Obra[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    endereco: '',
    tecnico: '',
    data: '',
    dateFrom: '',
    dateTo: '',
    tipoObra: ''
  });
  const [newMaterial, setNewMaterial] = useState({
    code: '',
    name: '',
    unit: '',
    category: 'Interno'
  });
  const { toast } = useToast();

  useEffect(() => {
    console.log('Interno page loaded, active tab:', activeTab);
    if (activeTab === 'materiais') {
      console.log('Loading materials...');
      loadMaterials();
    }
  }, [activeTab]);

  const loadObras = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'getObras',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(`${SCRIPT_URL}?${params}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setObras(data.obras || []);
      toast({
        title: "Consulta realizada",
        description: `${data.obras?.length || 0} obras encontradas`,
      });
    } catch (error) {
      console.error('Erro ao carregar obras:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as obras",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMaterials = async () => {
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getMaterials`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMaterials(data.materials || []);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os materiais",
      });
    }
  };

  const exportToExcel = () => {
    if (obras.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum dado",
        description: "Não há obras para exportar",
      });
      return;
    }

    // Criar dados para CSV (que pode ser aberto como Excel)
    const headers = ['Data', 'Técnico', 'Endereço', 'Número', 'Complemento', 'Tipo de Obra', 'Status', 'Materiais'];
    const csvData = obras.map(obra => [
      obra.Data,
      obra.Técnico,
      obra.Endereço,
      obra.Número,
      obra.Complemento,
      obra.Tipo_Obra,
      obra.Status,
      obra.materiais.map(m => `${m.name} (${m.quantity} ${m.unit})`).join('; ')
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `obras_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportação concluída",
      description: "Arquivo CSV baixado com sucesso",
    });
  };

  const addMaterial = async () => {
    if (!newMaterial.code || !newMaterial.name || !newMaterial.unit) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos do material",
      });
      return;
    }

    try {
      const params = new URLSearchParams({
        action: 'addMaterial',
        code: newMaterial.code,
        name: newMaterial.name,
        unit: newMaterial.unit,
        category: newMaterial.category
      });

      const response = await fetch(`${SCRIPT_URL}?${params}`, { method: 'POST' });
      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Material adicionado",
        description: "Material cadastrado com sucesso",
      });

      setNewMaterial({ code: '', name: '', unit: '', category: 'Interno' });
      loadMaterials();
    } catch (error) {
      console.error('Erro ao adicionar material:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar o material",
      });
    }
  };

  const deleteMaterial = async (code: string) => {
    try {
      const params = new URLSearchParams({
        action: 'deleteMaterial',
        code: code
      });

      const response = await fetch(`${SCRIPT_URL}?${params}`, { method: 'POST' });
      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Material excluído",
        description: "Material removido com sucesso",
      });

      loadMaterials();
    } catch (error) {
      console.error('Erro ao excluir material:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o material",
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      endereco: '',
      tecnico: '',
      data: '',
      dateFrom: '',
      dateTo: '',
      tipoObra: ''
    });
    setObras([]);
    toast({
      title: "Filtros limpos",
      description: "Todos os filtros foram removidos",
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
                  <Settings className="h-6 w-6" />
                  Cadastro de Materiais - Administração
                </h1>
                <p className="text-primary-foreground/80">Área de acesso para consulta e exportação de dados</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="consultar" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Consultar Obras
            </TabsTrigger>
            <TabsTrigger value="materiais" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Gerenciar Materiais
            </TabsTrigger>
          </TabsList>

          {/* Consultar Obras */}
          <TabsContent value="consultar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Consultar Obras e Materiais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Filtrar por Endereço:</Label>
                    <Input
                      placeholder="Digite o endereço"
                      value={filters.endereco}
                      onChange={(e) => setFilters(prev => ({ ...prev, endereco: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Filtrar por Técnico:</Label>
                    <Input
                      placeholder="Digite o nome do técnico"
                      value={filters.tecnico}
                      onChange={(e) => setFilters(prev => ({ ...prev, tecnico: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Filtrar por Data Específica:</Label>
                    <Input
                      type="date"
                      value={filters.data}
                      onChange={(e) => setFilters(prev => ({ ...prev, data: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Inicial:</Label>
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Final:</Label>
                    <Input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Obra:</Label>
                    <Select value={filters.tipoObra} onValueChange={(value) => setFilters(prev => ({ ...prev, tipoObra: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos</SelectItem>
                        <SelectItem value="Alivio">Alívio</SelectItem>
                        <SelectItem value="Adequacao">Adequação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-wrap gap-4">
                  <Button onClick={loadObras} disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Buscar Obras
                      </>
                    )}
                  </Button>
                  <Button variant="success" onClick={exportToExcel} disabled={obras.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar para Excel
                  </Button>
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar Filtros
                  </Button>
                </div>

                {/* Resultados */}
                {obras.length > 0 && (
                  <div className="rounded-lg border">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium">Data</th>
                            <th className="px-4 py-3 text-left font-medium">Técnico</th>
                            <th className="px-4 py-3 text-left font-medium">Endereço</th>
                            <th className="px-4 py-3 text-left font-medium">Número</th>
                            <th className="px-4 py-3 text-left font-medium">Tipo</th>
                            <th className="px-4 py-3 text-left font-medium">Status</th>
                            <th className="px-4 py-3 text-left font-medium">Materiais</th>
                          </tr>
                        </thead>
                        <tbody>
                          {obras.map((obra, index) => (
                            <tr key={index} className="border-t hover:bg-muted/50">
                              <td className="px-4 py-3">{obra.Data}</td>
                              <td className="px-4 py-3">{obra.Técnico}</td>
                              <td className="px-4 py-3">{obra.Endereço}</td>
                              <td className="px-4 py-3">{obra.Número}</td>
                              <td className="px-4 py-3">
                                <Badge variant="outline">{obra.Tipo_Obra}</Badge>
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant="default">{obra.Status}</Badge>
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant="secondary">
                                  {obra.materiais.length} materiais
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {obras.length === 0 && !loading && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma obra encontrada</h3>
                    <p>Utilize os filtros acima para buscar obras cadastradas no sistema.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gerenciar Materiais */}
          <TabsContent value="materiais" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Gerenciar Materiais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Adicionar Material */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar Novo Material
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>SKU:</Label>
                      <Input
                        placeholder="Código do material"
                        value={newMaterial.code}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, code: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição:</Label>
                      <Input
                        placeholder="Nome do material"
                        value={newMaterial.name}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unidade:</Label>
                      <Input
                        placeholder="Ex: UN, M, KG"
                        value={newMaterial.unit}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, unit: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria:</Label>
                      <Select value={newMaterial.category} onValueChange={(value) => setNewMaterial(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Interno">Interno</SelectItem>
                          <SelectItem value="Externo">Externo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={addMaterial}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Material
                  </Button>
                </div>

                {/* Lista de Materiais */}
                {materials.length > 0 && (
                  <div className="rounded-lg border">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium">SKU</th>
                            <th className="px-4 py-3 text-left font-medium">Descrição</th>
                            <th className="px-4 py-3 text-left font-medium">Unidade</th>
                            <th className="px-4 py-3 text-left font-medium">Estoque</th>
                            <th className="px-4 py-3 text-left font-medium">Categoria</th>
                            <th className="px-4 py-3 text-left font-medium">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {materials.map((material, index) => (
                            <tr key={index} className="border-t hover:bg-muted/50">
                              <td className="px-4 py-3 font-medium">{material.SKU}</td>
                              <td className="px-4 py-3">{material.Descrição}</td>
                              <td className="px-4 py-3">{material.Unidade}</td>
                              <td className="px-4 py-3">{material.Qtdd_Depósito}</td>
                              <td className="px-4 py-3">
                                <Badge variant={material.Categoria === 'Interno' ? 'default' : 'outline'}>
                                  {material.Categoria}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteMaterial(material.SKU)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {materials.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Nenhum material cadastrado</h3>
                    <p>Adicione materiais usando o formulário acima.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Interno;