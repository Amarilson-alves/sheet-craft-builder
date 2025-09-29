export type Material = {
  SKU: string;
  Descrição: string;
  Unidade: string;
  Qtdd_Depósito: number;
  Categoria: 'Interno' | 'Externo';
};

export type SelectedMaterial = Material & {
  quantidadeSelecionada: number;
};