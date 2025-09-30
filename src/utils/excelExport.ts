import * as XLSX from 'xlsx';

interface ObraExport {
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

interface MaterialRow {
  obra_id: string;
  cidade: string;
  UF: string;
  tecnico: string;
  data: string;
  status: string;
  SKU: string;
  Descrição: string;
  Unidade: string;
  Quantidade: number;
  obs: string;
}

interface ResumoRow {
  obra_id: string;
  itens_distintos: number;
  materiais_total: number;
  status: string;
  data: string;
}

export function exportObrasExcel(obras: ObraExport[]): void {
  if (obras.length === 0) {
    throw new Error('Nenhuma obra para exportar');
  }

  // Preparar dados para a aba "Materiais por Obra"
  const materialsRows: MaterialRow[] = [];
  
  obras.forEach((obra) => {
    obra.materiais.forEach((material) => {
      materialsRows.push({
        obra_id: obra['ID Obra'],
        cidade: obra.Endereço,
        UF: '', // TODO: extrair UF se disponível
        tecnico: obra.Técnico,
        data: formatDate(obra.Data),
        status: obra.Status,
        SKU: material.code,
        Descrição: material.name,
        Unidade: material.unit,
        Quantidade: material.quantity,
        obs: obra.Observacoes || '',
      });
    });
  });

  // Preparar dados para a aba "Resumo por Obra"
  const resumoRows: ResumoRow[] = obras.map((obra) => ({
    obra_id: obra['ID Obra'],
    itens_distintos: new Set(obra.materiais.map(m => m.code)).size,
    materiais_total: obra.materiais.reduce((sum, m) => sum + m.quantity, 0),
    status: obra.Status,
    data: formatDate(obra.Data),
  }));

  // Criar workbook
  const wb = XLSX.utils.book_new();

  // Aba 1: Materiais por Obra
  const ws1 = XLSX.utils.json_to_sheet(materialsRows);
  
  // Configurar AutoFilter
  const materialsRange = XLSX.utils.encode_range({
    s: { c: 0, r: 0 },
    e: { c: 10, r: materialsRows.length }
  });
  ws1['!autofilter'] = { ref: materialsRange };
  
  // Configurar larguras das colunas
  ws1['!cols'] = [
    { wch: 12 }, // obra_id
    { wch: 25 }, // cidade
    { wch: 5 },  // UF
    { wch: 20 }, // tecnico
    { wch: 12 }, // data
    { wch: 12 }, // status
    { wch: 15 }, // SKU
    { wch: 30 }, // Descrição
    { wch: 10 }, // Unidade
    { wch: 12 }, // Quantidade
    { wch: 25 }, // obs
  ];

  XLSX.utils.book_append_sheet(wb, ws1, 'Materiais por Obra');

  // Aba 2: Resumo por Obra
  const ws2 = XLSX.utils.json_to_sheet(resumoRows);
  
  // Configurar AutoFilter
  const resumoRange = XLSX.utils.encode_range({
    s: { c: 0, r: 0 },
    e: { c: 4, r: resumoRows.length }
  });
  ws2['!autofilter'] = { ref: resumoRange };
  
  // Configurar larguras das colunas
  ws2['!cols'] = [
    { wch: 12 }, // obra_id
    { wch: 15 }, // itens_distintos
    { wch: 15 }, // materiais_total
    { wch: 12 }, // status
    { wch: 12 }, // data
  ];

  XLSX.utils.book_append_sheet(wb, ws2, 'Resumo por Obra');

  // Gerar nome do arquivo
  const now = new Date();
  const fileName = `obras_export_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}.xlsx`;

  // Fazer download
  XLSX.writeFile(wb, fileName);
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr; // Retorna a string original se não conseguir converter
    }
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  } catch {
    return dateStr;
  }
}