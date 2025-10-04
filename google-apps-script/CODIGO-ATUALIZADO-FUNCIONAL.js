/**
 * ✅ GOOGLE APPS SCRIPT - VERSÃO CORRIGIDA E FUNCIONAL
 * 
 * Este código deve ser copiado e colado no editor do Google Apps Script
 * depois faça um NOVO DEPLOY da aplicação web
 * 
 * IMPORTANTE: Após deploy, atualize a URL no arquivo .env do projeto React
 */

const SPREADSHEET_ID = '1KgXl_kCdAoOQbxFo2iK4BUJdYmOyiAd7OZ45zCf-JUY';
const SHEET_NAMES = {
  materiais: 'Materiais',
  obras: 'Obras',
  materiaisUtilizados: 'Materiais Utilizados',
};

/**
 * Helper para retornar JSON
 */
function json(data) {
  return ContentService
    .createTextOutput(typeof data === 'string' ? data : JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
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
    Logger.log('doGet ERROR: ' + error.message);
    return json({ error: error.message, stack: error.stack });
  }
}

/**
 * ✅ Handler para requisições POST - DUAL-STACK (aceita URL-encoded E JSON puro)
 */
function doPost(e) {
  try {
    var action = null, payload = null;

    // 1) Tenta URL-encoded (e.parameter) - COMPATÍVEL COM CÓDIGO ATUAL
    if (e && e.parameter) {
      action = e.parameter.action || action;
      if (e.parameter.payload) {
        try { 
          payload = JSON.parse(e.parameter.payload); 
        } catch(_) {
          Logger.log('Payload não é JSON válido em e.parameter.payload');
        }
      }
    }

    // 2) Se não funcionou, tenta JSON puro em e.postData (para cURL e outros clients)
    if ((!action || payload === null) && e && e.postData && e.postData.contents) {
      var ct = (e.postData.type || '').toLowerCase();
      if (ct.indexOf('application/json') !== -1) {
        try {
          var body = JSON.parse(e.postData.contents);
          if (body && typeof body === 'object') {
            action = body.action || action;
            payload = body.payload !== undefined ? body.payload : (payload !== null ? payload : body);
          }
        } catch(jsonErr) {
          Logger.log('Erro ao parsear JSON de e.postData: ' + jsonErr.message);
        }
      }
    }

    Logger.log('doPost - action: ' + action);
    Logger.log('doPost - payload: ' + JSON.stringify(payload));
    
    if (!action) return json({ error: 'Ação POST não reconhecida' });

    switch (action) {
      case 'saveObra':
        return json(saveObra(payload));
      case 'addMaterial':
        return json(addMaterial(payload));
      case 'updateMaterial':
        return json(updateMaterial(payload));
      case 'incrementMaterial':
        return json(incrementMaterial(payload));
      case 'deleteMaterial':
        return json(deleteMaterial(payload));
      default:
        return json({ error: 'Ação POST não reconhecida: ' + action });
    }
  } catch (error) {
    Logger.log('doPost ERROR: ' + error.message);
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

    const materials = values.map(row => {
      const material = {};
      header.forEach((col, i) => material[col] = row[i]);
      return material;
    });

    return { ok: true, materials: materials, data: materials };
  } catch (err) {
    Logger.log('getMaterials ERROR: ' + err.message);
    return { error: err.message, stack: err.stack };
  }
}

/**
 * Busca materiais com paginação e filtro
 */
function searchMaterials(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.materiais);
    if (!sheet) throw new Error('Sheet não encontrada: ' + SHEET_NAMES.materiais);

    const search = (e.parameter.search || '').toLowerCase();
    const limit = parseInt(e.parameter.limit) || 10;
    const start = parseInt(e.parameter.start) || 0;

    const data = sheet.getDataRange().getValues();
    const header = data[0];
    const values = data.slice(1);

    let filtered = values.map(row => {
      const material = {};
      header.forEach((col, i) => material[col] = row[i]);
      return material;
    });

    if (search) {
      filtered = filtered.filter(m => {
        const sku = (m.SKU || '').toString().toLowerCase();
        const desc = (m.Descrição || '').toString().toLowerCase();
        return sku.includes(search) || desc.includes(search);
      });
    }

    const paginated = filtered.slice(start, start + limit);

    return {
      ok: true,
      materials: paginated,
      data: paginated,
      meta: {
        count: paginated.length,
        start: start,
        limit: limit,
        total: filtered.length,
        search: search
      }
    };
  } catch (err) {
    Logger.log('searchMaterials ERROR: ' + err.message);
    return { error: err.message, stack: err.stack };
  }
}

/**
 * Busca obras com filtros opcionais
 */
function getObras(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const obrasSheet = ss.getSheetByName(SHEET_NAMES.obras);
    const materiaisSheet = ss.getSheetByName(SHEET_NAMES.materiaisUtilizados);
    
    if (!obrasSheet) throw new Error('Sheet não encontrada: ' + SHEET_NAMES.obras);

    const obrasData = obrasSheet.getDataRange().getValues();
    const obrasHeader = obrasData[0];
    const obrasValues = obrasData.slice(1);

    let materaisData = [];
    if (materiaisSheet) {
      materaisData = materiaisSheet.getDataRange().getValues();
    }

    const results = obrasValues.map(row => {
      const obra = {};
      obrasHeader.forEach((col, i) => obra[col] = row[i]);
      
      // Buscar materiais utilizados nesta obra
      const obraId = obra['obra_id '] || obra.obra_id;
      const materiais = [];
      
      if (materaisData.length > 1 && obraId) {
        for (let i = 1; i < materaisData.length; i++) {
          if (materaisData[i][0] === obraId) {
            materiais.push({
              code: materaisData[i][1],
              name: materaisData[i][2],
              unit: materaisData[i][3],
              quantity: materaisData[i][4]
            });
          }
        }
      }
      
      obra.materiais = materiais;
      return obra;
    });

    return { ok: true, obras: results, meta: { count: results.length } };
  } catch (err) {
    Logger.log('getObras ERROR: ' + err.message);
    return { error: err.message, stack: err.stack };
  }
}

/**
 * ✅ SALVA UMA OBRA NA PLANILHA
 */
function saveObra(payload) {
  try {
    if (!payload) throw new Error('Payload vazio');
    
    Logger.log('saveObra - payload recebido: ' + JSON.stringify(payload));
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const obrasSheet = ss.getSheetByName(SHEET_NAMES.obras);
    const materiaisSheet = ss.getSheetByName(SHEET_NAMES.materiaisUtilizados);
    
    if (!obrasSheet) throw new Error('Sheet não encontrada: ' + SHEET_NAMES.obras);
    if (!materiaisSheet) throw new Error('Sheet não encontrada: ' + SHEET_NAMES.materiaisUtilizados);

    // Gerar ID se não fornecido
    const obraId = payload.obra_id || ('OBRA-' + Date.now());
    const dataAtual = payload.data || new Date().toISOString().slice(0, 10);
    
    // Preparar linha para a planilha de Obras
    const novaLinha = [
      obraId,                    // obra_id 
      payload.tecnico || '',     // tecnico
      payload.uf || '',          // uf
      payload.endereco || '',    // endereco
      payload.numero || '',      // numero
      payload.complemento || '', // complemento 
      payload.Tipo_obra || '',   // Tipo_obra
      payload.obs || '',         // obs
      dataAtual,                 // data 
      payload.status || 'Nova'   // status
    ];
    
    Logger.log('saveObra - linha a ser salva: ' + JSON.stringify(novaLinha));
    
    // Adicionar obra na planilha
    obrasSheet.appendRow(novaLinha);
    Logger.log('saveObra - Obra adicionada com sucesso na planilha');
    
    // Salvar materiais utilizados se houver
    if (payload.materiais && Array.isArray(payload.materiais)) {
      payload.materiais.forEach(function(mat) {
        const matLinha = [
          obraId,                    // obra_id
          payload.uf || '',          // uf
          payload.endereco || '',    // endereco
          payload.numero || '',      // numero
          mat.code || '',            // SKU
          mat.name || '',            // Descrição
          mat.unit || '',            // Unidade
          mat.quantity || 0,         // Quantidade
          dataAtual                  // Data_Utilização
        ];
        materiaisSheet.appendRow(matLinha);
      });
      Logger.log('saveObra - ' + payload.materiais.length + ' materiais salvos');
    }
    
    return { 
      message: 'Obra salva com sucesso', 
      obra_id: obraId,
      data: dataAtual
    };
  } catch (err) {
    Logger.log('saveObra - ERRO: ' + err.message);
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

    const results = values.filter(row => row[4] === category).map(row => {
      const item = {};
      header.forEach((col, i) => item[col] = row[i]);
      return item;
    });

    return { ok: true, data: results, meta: { count: results.length } };
  } catch (err) {
    Logger.log('getMaterialsByCategory ERROR: ' + err.message);
    return { error: err.message, stack: err.stack };
  }
}

/**
 * ✅ ADICIONA UM NOVO MATERIAL
 */
function addMaterial(payload) {
  try {
    if (!payload) throw new Error('Payload vazio');
    
    Logger.log('addMaterial - payload: ' + JSON.stringify(payload));
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.materiais);
    if (!sheet) throw new Error('Sheet não encontrada: ' + SHEET_NAMES.materiais);

    const sku = payload.SKU || payload.code;
    if (!sku) throw new Error('SKU é obrigatório');

    const novaLinha = [
      sku,
      payload.Descrição || payload.descricao || payload.name || '',
      payload.Unidade || payload.unidade || payload.unit || '',
      payload.Qtdd_Depósito !== undefined ? payload.Qtdd_Depósito : (payload.qtdd_deposito !== undefined ? payload.qtdd_deposito : (payload.quantity !== undefined ? payload.quantity : 0)),
      payload.Categoria || payload.categoria || payload.category || ''
    ];

    sheet.appendRow(novaLinha);
    Logger.log('addMaterial - Material adicionado com sucesso');
    
    return { ok: true, message: 'Material adicionado com sucesso', SKU: sku };
  } catch (err) {
    Logger.log('addMaterial ERROR: ' + err.message);
    return { error: err.message, stack: err.stack };
  }
}

/**
 * ✅ ATUALIZA UM MATERIAL EXISTENTE
 */
function updateMaterial(payload) {
  try {
    if (!payload) throw new Error('Payload vazio');
    
    Logger.log('updateMaterial - payload: ' + JSON.stringify(payload));
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.materiais);
    if (!sheet) throw new Error('Sheet não encontrada: ' + SHEET_NAMES.materiais);

    const id = payload.id || payload.SKU;
    if (!id) throw new Error('ID/SKU é obrigatório');

    const data = sheet.getDataRange().getValues();
    let row = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        row = i + 1;
        break;
      }
    }

    if (row === -1) throw new Error('Material não encontrado: ' + id);

    const valores = [
      id,
      payload.Descrição || payload.descricao || data[row-1][1],
      payload.Unidade || payload.unidade || data[row-1][2],
      payload.Qtdd_Depósito !== undefined ? payload.Qtdd_Depósito : 
        (payload.qtdd_deposito !== undefined ? payload.qtdd_deposito : data[row-1][3]),
      payload.Categoria || payload.categoria || data[row-1][4]
    ];

    sheet.getRange(row, 1, 1, valores.length).setValues([valores]);
    Logger.log('updateMaterial - Material atualizado com sucesso');
    
    return { ok: true, message: 'Material atualizado com sucesso' };
  } catch (err) {
    Logger.log('updateMaterial ERROR: ' + err.message);
    return { error: err.message, stack: err.stack };
  }
}

/**
 * ✅ INCREMENTA A QUANTIDADE DE UM MATERIAL
 */
function incrementMaterial(payload) {
  try {
    if (!payload) throw new Error('Payload vazio');
    
    Logger.log('incrementMaterial - payload: ' + JSON.stringify(payload));
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.materiais);
    if (!sheet) throw new Error('Sheet não encontrada: ' + SHEET_NAMES.materiais);

    const id = payload.id || payload.sku || payload.SKU;
    const delta = payload.delta || payload.quantity || 0;
    
    if (!id) throw new Error('ID/SKU é obrigatório');

    const data = sheet.getDataRange().getValues();
    let row = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        row = i + 1;
        break;
      }
    }

    if (row === -1) throw new Error('Material não encontrado: ' + id);

    const qtdAtual = Number(data[row-1][3]) || 0;
    const novaQtd = qtdAtual + Number(delta);

    sheet.getRange(row, 4).setValue(novaQtd);
    Logger.log('incrementMaterial - Quantidade atualizada: ' + novaQtd);
    
    return { 
      ok: true, 
      message: 'Quantidade atualizada com sucesso',
      newQty: novaQtd
    };
  } catch (err) {
    Logger.log('incrementMaterial ERROR: ' + err.message);
    return { error: err.message, stack: err.stack };
  }
}

/**
 * ✅ DELETA UM MATERIAL
 */
function deleteMaterial(payload) {
  try {
    if (!payload) throw new Error('Payload vazio');
    
    Logger.log('deleteMaterial - payload: ' + JSON.stringify(payload));
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.materiais);
    if (!sheet) throw new Error('Sheet não encontrada: ' + SHEET_NAMES.materiais);

    const id = payload.id || payload.SKU;
    if (!id) throw new Error('ID/SKU é obrigatório');

    const data = sheet.getDataRange().getValues();
    let row = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        row = i + 1;
        break;
      }
    }

    if (row === -1) throw new Error('Material não encontrado: ' + id);

    sheet.deleteRow(row);
    Logger.log('deleteMaterial - Material deletado com sucesso');
    
    return { ok: true, message: 'Material excluído com sucesso' };
  } catch (err) {
    Logger.log('deleteMaterial ERROR: ' + err.message);
    return { error: err.message, stack: err.stack };
  }
}
