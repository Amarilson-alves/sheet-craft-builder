/**
 * Flatten obras para exportação Excel
 * Converte obras com materiais em uma linha por material
 */
export function flattenObras(obras: any[]) {
  const rows: any[] = [];
  
  console.log('flattenObras - Input obras:', JSON.stringify(obras, null, 2));
  
  for (const o of obras) {
    console.log('Processing obra:', o.obra_id, 'materiais:', o.materiais);
    const base = {
      obra_id: o.obra_id ?? o['obra_id '] ?? o.ID ?? o.id ?? "",
      tecnico: o.tecnico ?? "",
      uf: o.uf ?? "",
      endereco: o.endereco ?? "",
      numero: o.numero ?? "",
      complemento: o.complemento ?? o['complemento '] ?? "",
      Tipo_obra: o.Tipo_obra ?? "",
      obs: o.obs ?? "",
      data: o.data ?? o['data '] ?? o.Data ?? "",
      status: o.status ?? "",
    };

    if (!Array.isArray(o.materiais) || o.materiais.length === 0) {
      // Obra sem materiais - adiciona uma linha vazia
      rows.push({ 
        ...base, 
        SKU: "", 
        Descrição: "", 
        Unidade: "", 
        Quantidade: 0 
      });
      continue;
    }

    // Adiciona uma linha por material
    for (const m of o.materiais) {
      rows.push({
        ...base,
        SKU: m.SKU ?? "",
        Descrição: m.Descrição ?? m['Descrição '] ?? "",
        Unidade: m.Unidade ?? "",
        Quantidade: Number(m.Quantidade ?? 0),
      });
    }
  }
  
  return rows;
}
