/**
 * CÓDIGO CORRIGIDO DO GOOGLE APPS SCRIPT
 * 
 * IMPORTANTE: ContentService NÃO suporta setHeader()!
 * Esta versão remove todas as tentativas de usar setHeader.
 * 
 * Para resolver CORS, use um proxy no seu domínio (Edge Function, Vercel, etc.)
 */

const SPREADSHEET_ID = '1KgXl_kCdAoOQbxFo2iK4BUJdYmOyiAd7OZ45zCf-JUY';
const SHEET_NAMES = {
  materiais: 'Materiais',
  obras: 'Obras',
  materiaisUtilizados: 'Materiais Utilizados',
};

/**
 * Helper para retornar JSON (SEM setHeader - não suportado pelo GAS)
 */
function json(data) {
  return ContentService
    .createTextOutput(typeof data === 'string' ? data : JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Responde ao preflight OPTIONS (mas sem headers CORS customizados)
 */
function doOptions(e) {
  return json({ ok: true });
}

/**
 * Handler para requisições GET
 */
function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : null;
    if (!action) return json({ error: 'Ação não reconhecida' });

    switch (action) {
      case 'getMaterials':
        return json(getMaterials(e));
      case 'searchMaterials':
        return json(searchMaterials(e));
      case 'getObras':
        return json(getObras(e));
      case 'getMaterialsByCategory':
        return json(getMaterialsByCategory(e));
      case 'test':
        return json({ message: 'OK', status: 'UP', timestamp: new Date().toISOString() });
      default:
        return json({ error: 'Ação não reconhecida: ' + action });
    }
  } catch (error) {
    return json({ error: error.message, stack: error.stack });
  }
}

/**
 * Handler para requisições POST
 */
function doPost(e) {
  try {
    let action = (e && e.parameter && e.parameter.action) ? e.parameter.action : null;
    let body = {};
    
    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (_) {}
      if (!action && body.action) action = body.action;
    }
    
    if (!action) return json({ error: 'Ação POST não reconhecida' });

    switch (action) {
      case 'saveObra':
        if (body && body.data) {
          e.parameter = Object.assign({}, e.parameter, { payload: JSON.stringify(body.data) });
        }
        return json(saveObra(e));
      case 'addMaterial':
        return json(addMaterial(body));
      case 'updateMaterial':
        return json(updateMaterial(body));
      case 'incrementMaterial':
        return json(incrementMaterial(body));
      case 'deleteMaterial':
        return json(deleteMaterial(body));
      default:
        return json({ error: 'Ação POST não reconhecida: ' + action });
    }
  } catch (error) {
    return json({ error: error.message, stack: error.stack });
  }
}

/**
 * Busca todos os materiais da planilha
 */
function getMaterials(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.materiais);
    if (!sheet) throw new Error('Sheet não encontrada: ' + SHEET_NAMES.materiais);

    const data = sheet.getDataRange().getValues();
    const header = data[0].map(h => String(h).trim()); // Remove espaços extras
    const values = data.slice(1);

    const results = values.map(row => {
      const item = {};
      header.forEach((col, i) => item[col] = row[i]);
      return item;
    });

    return { ok: true, materials: results, data: results, meta: { count: results.length } };
  } catch (err) {
    return { error: err.message, stack: err.stack };
  }
}

/**
 * Busca materiais da planilha com paginação e filtro
 */
function searchMaterials(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.materiais);
    if (!sheet) throw new Error('Sheet não encontrada: ' + SHEET_NAMES.materiais);

    let start = Number(e.parameter.start) || 0;
    let limit = Number(e.parameter.limit) || 10;
    limit = Math.min(limit, 100); // hard limit
    const searchTerm = e.parameter.search || '';

    const data = sheet.getDataRange().getValues();
    const header = data[0];
    let values = data.slice(1);

    // Filter
    if (searchTerm) {
      values = values.filter(row => {
        for (const cell of row) {
          if (typeof cell === 'string' && cell.toLowerCase().includes(searchTerm.toLowerCase())) {
            return true;
          }
        }
        return false;
      });
    }

    // Paginate
    const total = values.length;
    values = values.slice(start, start + limit);

    const results = values.map(row => {
      const item = {};
      header.forEach((col, i) => item[col] = row[i]);
      return item;
    });

    return {
      data: results,
      meta: {
        count: results.length,
        start: start,
        limit: limit,
        total: total,
        search: searchTerm
      }
    };
  } catch (err) {
    return { error: err.message, stack: err.stack };
  }
}

/**
 * Busca todas as obras da planilha COM os materiais utilizados
 */
function getObras(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetObras = ss.getSheetByName(SHEET_NAMES.obras);
    const sheetMateriais = ss.getSheetByName(SHEET_NAMES.materiaisUtilizados);
    
    if (!sheetObras) throw new Error('Sheet não encontrada: ' + SHEET_NAMES.obras);
    if (!sheetMateriais) throw new Error('Sheet não encontrada: ' + SHEET_NAMES.materiaisUtilizados);

    // Buscar obras
    const dataObras = sheetObras.getDataRange().getValues();
    const headerObras = dataObras[0].map(h => String(h).trim()); // Remove espaços extras
    const valuesObras = dataObras.slice(1);

    // Buscar materiais utilizados
    const dataMateriais = sheetMateriais.getDataRange().getValues();
    const headerMateriais = dataMateriais[0].map(h => String(h).trim()); // Remove espaços extras
    const valuesMateriais = dataMateriais.slice(1);

    // Aplicar filtros se fornecidos
    let filteredObras = valuesObras;
    
    if (e && e.parameter) {
      const filters = e.parameter;
      
      filteredObras = valuesObras.filter(row => {
        const obraObj = {};
        headerObras.forEach((col, i) => obraObj[col] = row[i]);
        
        // Filtro por endereço
        if (filters.endereco && !String(obraObj.endereco || '').toLowerCase().includes(filters.endereco.toLowerCase())) {
          return false;
        }
        
        // Filtro por técnico
        if (filters.tecnico && !String(obraObj.tecnico || '').toLowerCase().includes(filters.tecnico.toLowerCase())) {
          return false;
        }
        
        // Filtro por tipo de obra
        if (filters.tipoObra && filters.tipoObra !== 'todos' && obraObj.Tipo_obra !== filters.tipoObra) {
          return false;
        }
        
        // Filtro por data específica
        if (filters.data) {
          const obraDate = new Date(obraObj.data);
          const filterDate = new Date(filters.data);
          if (obraDate.toDateString() !== filterDate.toDateString()) {
            return false;
          }
        }
        
        // Filtro por período (dateFrom e dateTo)
        if (filters.dateFrom || filters.dateTo) {
          const obraDate = new Date(obraObj.data);
          
          if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            if (obraDate < fromDate) return false;
          }
          
          if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            toDate.setHours(23, 59, 59, 999); // Incluir todo o dia
            if (obraDate > toDate) return false;
          }
        }
        
        return true;
      });
    }

    // Montar resultado com materiais
    const results = filteredObras.map(row => {
      const obra = {};
      headerObras.forEach((col, i) => obra[col] = row[i]);
      
      // Buscar materiais desta obra
      const obraId = obra.obra_id;
      const materiaisObra = valuesMateriais
        .filter(matRow => {
          const matObj = {};
          headerMateriais.forEach((col, i) => matObj[col] = matRow[i]);
          return matObj.obra_id === obraId;
        })
        .map(matRow => {
          const mat = {};
          headerMateriais.forEach((col, i) => mat[col] = matRow[i]);
          return {
            code: mat.SKU || mat.sku || mat.code || '',
            name: mat.Descrição || mat.descricao || mat.name || '',
            unit: mat.Unidade || mat.unidade || mat.unit || '',
            quantity: Number(mat.Quantidade || mat.quantidade || mat.quantity || 0)
          };
        });
      
      obra.materiais = materiaisObra;
      return obra;
    });

    return { ok: true, obras: results, meta: { count: results.length } };
  } catch (err) {
    return { error: err.message, stack: err.stack };
  }
}

/**
 * Salva uma obra na planilha
 */
function saveObra(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.obras);
    if (!sheet) throw new Error('Sheet não encontrada: ' + SHEET_NAMES.obras);

    const payload = JSON.parse(e.parameter.payload);
    const header = sheet.getDataRange().getValues()[0];

    // Find existing row or create a new one
    let row = null;
    if (payload.id) {
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === payload.id) {
          row = i + 1;
          break;
        }
      }
    }

    let values = header.map(col => payload[col] || '');

    if (row) {
      sheet.getRange(row, 1, 1, values.length).setValues([values]);
    } else {
      sheet.appendRow(values);
    }

    return { message: 'Obra salva com sucesso', data: payload };
  } catch (err) {
    return { error: err.message, stack: err.stack };
  }
}

/**
 * Busca materiais por categoria
 */
function getMaterialsByCategory(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.materiais);
    if (!sheet) throw new Error('Sheet não encontrada: ' + SHEET_NAMES.materiais);

    const category = e.parameter.category;
    if (!category) throw new Error('Categoria não informada');

    const data = sheet.getDataRange().getValues();
    const header = data[0];
    const values = data.slice(1);

    const results = values.filter(row => row[2] === category).map(row => {
      const item = {};
      header.forEach((col, i) => item[col] = row[i]);
      return item;
    });

    return { data: results, meta: { count: results.length } };
  } catch (err) {
    return { error: err.message, stack: err.stack };
  }
}

/**
 * Adiciona um novo material
 */
function addMaterial(body) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.materiais);
    if (!sheet) throw new Error('Sheet não encontrada: ' + SHEET_NAMES.materiais);

    const header = sheet.getDataRange().getValues()[0];
    const values = header.map(col => body[col] || '');

    sheet.appendRow(values);

    return { message: 'Material adicionado com sucesso', data: body };
  } catch (err) {
    return { error: err.message, stack: err.stack };
  }
}

/**
 * Atualiza um material existente
 */
function updateMaterial(body) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.materiais);
    if (!sheet) throw new Error('Sheet não encontrada: ' + SHEET_NAMES.materiais);

    const id = body.id;
    if (!id) throw new Error('ID do material não informado');

    const data = sheet.getDataRange().getValues();
    let row = null;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        row = i + 1;
        break;
      }
    }

    if (!row) throw new Error('Material não encontrado com o ID: ' + id);

    const header = sheet.getDataRange().getValues()[0];
    const values = header.map(col => body[col] || '');

    sheet.getRange(row, 1, 1, values.length).setValues([values]);

    return { message: 'Material atualizado com sucesso', data: body };
  } catch (err) {
    return { error: err.message, stack: err.stack };
  }
}

/**
 * Incrementa a quantidade de um material
 */
function incrementMaterial(body) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.materiais);
    if (!sheet) throw new Error('Sheet não encontrada: ' + SHEET_NAMES.materiais);

    const id = body.id;
    if (!id) throw new Error('ID do material não informado');

    const data = sheet.getDataRange().getValues();
    let row = null;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        row = i + 1;
        break;
      }
    }

    if (!row) throw new Error('Material não encontrado com o ID: ' + id);

    const quantity = Number(body.quantity) || 0;
    const currentQuantity = Number(sheet.getRange(row, 5).getValue()) || 0;
    const newQuantity = currentQuantity + quantity;

    sheet.getRange(row, 5).setValue(newQuantity);

    return { message: 'Quantidade incrementada com sucesso', data: { id: id, quantity: newQuantity } };
  } catch (err) {
    return { error: err.message, stack: err.stack };
  }
}

/**
 * Deleta um material
 */
function deleteMaterial(body) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.materiais);
    if (!sheet) throw new Error('Sheet não encontrada: ' + SHEET_NAMES.materiais);

    const id = body.id;
    if (!id) throw new Error('ID do material não informado');

    const data = sheet.getDataRange().getValues();
    let row = null;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        row = i + 1;
        break;
      }
    }

    if (!row) throw new Error('Material não encontrado com o ID: ' + id);

    sheet.deleteRow(row);

    return { message: 'Material deletado com sucesso', data: { id: id } };
  } catch (err) {
    return { error: err.message, stack: err.stack };
  }
}
