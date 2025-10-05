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
import { MaterialsSearchModal } from "@/components/MaterialsSearchModal";
import { BackButton } from "@/components/BackButton";
import { exportObrasExcel } from "@/utils/excelExport";
import { gasGet, gasPost } from "@/lib/gasClient";
import { formatSKU } from "@/lib/formatSKU";

interface Obra {
  obra_id: string | number;
  tecnico: string;
  uf: string;
  endereco: string;
  numero: number;
  complemento: string;
  Tipo_obra: string;
  obs: string;
  data: string;
  status: string;
  materiais?: Array<{
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
    uf: 'todos',
    data: '',
    dateFrom: '',
    dateTo: '',
    tipoObra: 'todos'
  });
  const [newMaterial, setNewMaterial] = useState({
    code: '',
    name: '',
    unit: '',
    category: 'Interno'
  });
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
      const params: Record<string, string> = {
        action: 'getObras',
        ...Object.fromEntries(
          Object.entries(filters)
            .filter(([key, v]) => v && !(key === 'tipoObra' && v === 'todos') && !(key === 'uf' && v === 'todos'))
            .map(([k, v]) => [k, String(v)])
        )
      };

      const data = await gasGet(params);

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
      const data = await gasGet({ action: 'getMaterials' });

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

    try {
      exportObrasExcel(obras);
      toast({
        title: "Exportação concluída",
        description: "Arquivo Excel baixado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        variant: "destructive",
        title: "Erro na exportação",
        description: error instanceof Error ? error.message : "Não foi possível exportar o arquivo",
      });
    }
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
      const payload = {
        SKU: newMaterial.code.trim(),
        Descrição: newMaterial.name.trim(),
        Unidade: newMaterial.unit.trim(),
        Qtdd_Depósito: 0, // Quantidade inicial
        Categoria: newMaterial.category || 'Interno',
      };

      console.log('addMaterial payload:', payload);

      const result = await gasPost('addMaterial', payload);

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
      const payload = { id: code.trim() };
      console.log('deleteMaterial payload:', payload);
      
      const result = await gasPost('deleteMaterial', payload);

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
      uf: 'todos',
      data: '',
      dateFrom: '',
      dateTo: '',
      tipoObra: 'todos'
    });
    setObras([]);
    toast({
      title: "Filtros limpos",
      description: "Todos os filtros foram removidos",
    });
  };

  const handleConsulta = () => {
    // Validar que pelo menos um campo está preenchido
    const sku = newMaterial.code?.trim();
    const desc = newMaterial.name?.trim();
    
    if (!sku && !desc) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Informe SKU ou Descrição para consultar",
      });
      return;
    }

    // Montar query de busca priorizando SKU
    const query = sku || desc;
    setSearchQuery(query);
    setSearchModalOpen(true);
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
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                  <span className="truncate">Administração</span>
                </h1>
                <p className="text-primary-foreground/80 text-xs sm:text-sm hidden sm:block">Área de acesso para consulta e exportação de dados</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 p-2 gap-2">
            <TabsTrigger value="consultar" className="flex items-center gap-2 py-3">
              <Search className="h-5 w-5" />
              Consultar Obras
            </TabsTrigger>
            <TabsTrigger value="materiais" className="flex items-center gap-2 py-3">
              <Package className="h-5 w-5" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Filtrar por Endereço:</Label>
                    <Input
                      placeholder="Digite o endereço"
                      value={filters.endereco}
                      onChange={(e) => setFilters(prev => ({ ...prev, endereco: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Filtrar por Técnico:</Label>
                    <Input
                      placeholder="Digite o nome do técnico"
                      value={filters.tecnico}
                      onChange={(e) => setFilters(prev => ({ ...prev, tecnico: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Filtrar por UF:</Label>
                    <Select value={filters.uf} onValueChange={(value) => setFilters(prev => ({ ...prev, uf: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="PR">PR</SelectItem>
                        <SelectItem value="PRI">PRI</SelectItem>
                        <SelectItem value="SC">SC</SelectItem>
                        <SelectItem value="RS">RS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Filtrar por Data Específica:</Label>
                    <Input
                      type="date"
                      value={filters.data}
                      onChange={(e) => setFilters(prev => ({ ...prev, data: e.target.value, dateFrom: '', dateTo: '' }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Data Inicial:</Label>
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value, data: '' }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Data Final:</Label>
                    <Input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value, data: '' }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Tipo de Obra:</Label>
                    <Select value={filters.tipoObra} onValueChange={(value) => setFilters(prev => ({ ...prev, tipoObra: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="Alivio">Alívio</SelectItem>
                        <SelectItem value="Adequacao">Adequação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                  <Button onClick={loadObras} disabled={loading} className="w-full sm:w-auto">
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
                  <Button variant="success" onClick={exportToExcel} disabled={obras.length === 0} className="w-full sm:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Excel
                  </Button>
                  <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
                    Limpar Filtros
                  </Button>
                </div>

                {/* Resultados */}
                {obras.length > 0 && (
                  <div className="rounded-lg border">
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <div className="inline-block min-w-full align-middle">
                        <table className="min-w-full divide-y divide-border">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium whitespace-nowrap">Data</th>
                              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium whitespace-nowrap">Técnico</th>
                              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium whitespace-nowrap hidden md:table-cell">Endereço</th>
                              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium whitespace-nowrap hidden sm:table-cell">Número</th>
                              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium whitespace-nowrap">Tipo</th>
                              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium whitespace-nowrap hidden lg:table-cell">Status</th>
                              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium whitespace-nowrap">Materiais</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border bg-background">
                            {obras.map((obra, index) => (
                              <tr key={index} className="hover:bg-muted/50">
                                <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm whitespace-nowrap">
                                  {obra.data ? new Date(obra.data).toLocaleDateString('pt-BR') : '-'}
                                </td>
                                <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">{obra.tecnico}</td>
                                <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">{obra.endereco}</td>
                                <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">{obra.numero}</td>
                                <td className="px-3 sm:px-4 py-3">
                                  <Badge variant="outline" className="text-xs">{obra.Tipo_obra}</Badge>
                                </td>
                                <td className="px-3 sm:px-4 py-3 hidden lg:table-cell">
                                  <Badge variant="default" className="text-xs">{obra.status || 'Pendente'}</Badge>
                                </td>
                                <td className="px-3 sm:px-4 py-3">
                                  <Badge variant="secondary" className="text-xs whitespace-nowrap">
                                    {obra.materiais?.length || 0}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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
                        placeholder="xxxx-xxxx-x"
                        value={newMaterial.code}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, code: formatSKU(e.target.value) }))}
                        maxLength={11}
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
                      <Select value={newMaterial.unit} onValueChange={(value) => setNewMaterial(prev => ({ ...prev, unit: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KG">KG</SelectItem>
                          <SelectItem value="UN">UN</SelectItem>
                          <SelectItem value="MT">MT</SelectItem>
                          <SelectItem value="CX">CX</SelectItem>
                        </SelectContent>
                      </Select>
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
                  <div className="flex gap-2">
                    <Button onClick={addMaterial}>
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Material
                    </Button>
                    <Button variant="outline" onClick={handleConsulta}>
                      <Search className="h-4 w-4 mr-2" />
                      Consulta
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Consulta (fora das tabs) */}
        <MaterialsSearchModal
          open={searchModalOpen}
          onOpenChange={setSearchModalOpen}
          initialQuery={searchQuery}
          autoSearch={true}
        />
      </main>
    </div>
  );
};

export default Interno;