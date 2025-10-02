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
    const header = data[0];
    const values = data.slice(1);

    const results = values.map(row => {
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
 * Busca todas as obras da planilha
 */
function getObras(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.obras);
    if (!sheet) throw new Error('Sheet não encontrada: ' + SHEET_NAMES.obras);

    const data = sheet.getDataRange().getValues();
    const header = data[0];
    const values = data.slice(1);

    const results = values.map(row => {
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
