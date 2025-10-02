// ID da planilha principal
const SPREADSHEET_ID = '1Wkyst7OAeZ9XtoOgkm88psU_mV495knbNYPiCiz1cmU';

// Nomes das abas
const SHEET_NAMES = {
  MATERIAIS: 'Materiais',
  OBRAS: 'Obras', 
  MATERIAIS_UTILIZADOS: 'Materiais Utilizados'
};

// Responder às preflight requests (CORS)
function doOptions(e) {
  return createCORSResponse({});
}

function doGet(e) {
  const action = e.parameter.action;
  
  try {
    switch(action) {
      case 'getMaterials':
        return createCORSResponse(getMaterials(e));
      case 'searchMaterials':
        return createCORSResponse(searchMaterials(e));
      case 'getObras':
        return createCORSResponse(getObras(e));
      case 'getMaterialsByCategory':
        return createCORSResponse(getMaterialsByCategory(e));
      case 'test':
        return createCORSResponse({message: "Conexão bem-sucedida", status: "OK"});
      default:
        return createCORSResponse({error: 'Ação não reconhecida'});
    }
  } catch (error) {
    return createCORSResponse({error: error.message});
  }
}

function doPost(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : null;
    var body = {};
    
    if (e && e.postData && e.postData.contents) {
      try { 
        body = JSON.parse(e.postData.contents); 
      } catch(_) {}
      if (!action && body.action) action = body.action;
    }

    switch (action) {
      case 'saveObra':
        if (body && body.data) {
          e.parameter = Object.assign({}, e.parameter, { payload: JSON.stringify(body.data) });
        }
        return createCORSResponse(saveObra(e));
      
      case 'addMaterial':
        return createCORSResponse(addMaterial(body));
      
      case 'updateMaterial':
        return createCORSResponse(updateMaterial(body));
      
      case 'incrementMaterial':
        return createCORSResponse(incrementMaterial(body));
      
      case 'deleteMaterial':
        return createCORSResponse(deleteMaterial(body));
      
      default:
        return createCORSResponse({ error: 'Ação POST não reconhecida: ' + action });
    }
  } catch (error) {
    return createCORSResponse({ error: error.message, stack: error.stack });
  }
}

// ==================== FUNÇÕES GET ====================

function getMaterialsByCategory(e) {
  try {
    const category = e.parameter.category;
    
    if (!category) {
      return { error: 'Categoria não especificada' };
    }
    
    const sheet = getSheet(SHEET_NAMES.MATERIAIS);
    const data = sheet.getDataRange().getValues();
    
    const materials = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] && row[0].toString().trim() !== "") {
        if (row[4] === category) {
          materials.push({
            SKU: row[0],
            Descrição: row[1],
            Unidade: row[2],
            Qtdd_Depósito: row[3],
            Categoria: row[4] || 'Interno'
          });
        }
      }
    }
    
    return { materials: materials, total: materials.length, category: category };
  } catch (error) {
    return { error: error.message };
  }
}

function getMaterials(e) {
  try {
    const category = e.parameter.category || '';
    
    const sheet = getSheet(SHEET_NAMES.MATERIAIS);
    const data = sheet.getDataRange().getValues();
    
    const materials = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] && row[0].toString().trim() !== "") {
        // Filtrar por categoria se especificado
        if (category && category !== 'all' && row[4] !== category) continue;
        
        materials.push({
          SKU: row[0],
          Descrição: row[1],
          Unidade: row[2],
          Qtdd_Depósito: row[3],
          Categoria: row[4] || 'Interno'
        });
      }
    }
    
    return { materials: materials, total: materials.length };
  } catch (error) {
    return { error: error.message };
  }
}

function searchMaterials(e) {
  try {
    const query = (e.parameter.query || '').toLowerCase().trim();
    
    if (!query) {
      return { materials: [] };
    }
    
    const sheet = getSheet(SHEET_NAMES.MATERIAIS);
    const data = sheet.getDataRange().getValues();
    
    const materials = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] && row[0].toString().trim() !== "") {
        const sku = (row[0] || '').toString().toLowerCase();
        const desc = (row[1] || '').toString().toLowerCase();
        
        if (sku.indexOf(query) !== -1 || desc.indexOf(query) !== -1) {
          materials.push({
            SKU: row[0],
            Descrição: row[1],
            Unidade: row[2],
            Qtdd_Depósito: row[3],
            Categoria: row[4] || 'Interno'
          });
        }
      }
    }
    
    return { materials: materials.slice(0, 50) };
  } catch (error) {
    return { error: error.message };
  }
}

function getObras(e) {
  try {
    const endereco = e.parameter.endereco;
    const tecnico = e.parameter.tecnico;
    const dataFiltro = e.parameter.data;
    const dateFrom = e.parameter.dateFrom;
    const dateTo = e.parameter.dateTo;
    const tipoObra = e.parameter.tipoObra;
    
    const obrasSheet = getSheet(SHEET_NAMES.OBRAS);
    const obrasData = obrasSheet.getDataRange().getValues();
    
    const materiaisSheet = getSheet(SHEET_NAMES.MATERIAIS_UTILIZADOS);
    const materiaisData = materiaisSheet.getDataRange().getValues();
    
    const obras = [];
    
    // Cabeçalho: obra_id, tecnico, uf, endereco, numero, complemento, Tipo_obra, obs, data, status
    for (let i = 1; i < obrasData.length; i++) {
      const obraRow = obrasData[i];
      
      if (!obraRow[0] && !obraRow[1] && !obraRow[2]) continue;
      
      const obraDataValue = obraRow[8] ? new Date(obraRow[8]) : null;
      const obraDataString = obraRow[8] ? new Date(obraRow[8]).toISOString().split('T')[0] : '';
      
      if (dataFiltro && obraDataString !== dataFiltro) continue;
      
      if (dateFrom && obraDataValue) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (obraDataValue < fromDate) continue;
      }
      
      if (dateTo && obraDataValue) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (obraDataValue > toDate) continue;
      }
      
      const obra = {
        'ID Obra': obraRow[0] || '',
        'Técnico': obraRow[1] || '',
        'UF': obraRow[2] || '',
        'Endereço': obraRow[3] || '',
        'Número': obraRow[4] || '',
        'Complemento': obraRow[5] || '',
        'Tipo_Obra': obraRow[6] || '',
        'Observacoes': obraRow[7] || '',
        'Data': obraDataString,
        'Status': obraRow[9] || '',
        materiais: []
      };
      
      if (endereco && obra['Endereço'].toLowerCase().indexOf(endereco.toLowerCase()) === -1) continue;
      if (tecnico && obra['Técnico'].toLowerCase().indexOf(tecnico.toLowerCase()) === -1) continue;
      if (tipoObra && obra['Tipo_Obra'].toLowerCase() !== tipoObra.toLowerCase()) continue;
      
      // Cabeçalho Materiais Utilizados: obra_id, uf, endereco, numero, SKU, Descrição, Unidade, Quantidade, Data_Utilização
      for (let j = 1; j < materiaisData.length; j++) {
        const materialRow = materiaisData[j];
        if (materialRow[0] === obra['ID Obra']) {
          obra.materiais.push({
            code: materialRow[4] || '',
            name: materialRow[5] || '',
            unit: materialRow[6] || '',
            quantity: materialRow[7] || 0
          });
        }
      }
      
      obras.push(obra);
    }
    
    return { obras: obras, total: obras.length };
  } catch (error) {
    return { error: error.message };
  }
}

// ==================== FUNÇÕES POST ====================

function saveObra(e) {
  try {
    const payload = JSON.parse(e.parameter.payload);
    const dataAtual = new Date();
    
    const obraId = payload.idObra || `OBRA-${dataAtual.getFullYear()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // Cabeçalho Obras: obra_id, tecnico, uf, endereco, numero, complemento, Tipo_obra, obs, data, status
    const obraSheet = getSheet(SHEET_NAMES.OBRAS);
    const novaObra = [
      obraId,
      payload.tecnico || '',
      payload.uf || '',
      payload.endereco || '',
      payload.numero || '',
      payload.complemento || '',
      payload.tipoObra || '',
      payload.obs || '',
      dataAtual,
      "Concluída"
    ];
    obraSheet.appendRow(novaObra);
    
    // Cabeçalho Materiais Utilizados: obra_id, uf, endereco, numero, SKU, Descrição, Unidade, Quantidade, Data_Utilização
    const materiaisSheet = getSheet(SHEET_NAMES.MATERIAIS_UTILIZADOS);
    if (payload.materiais && payload.materiais.length > 0) {
      payload.materiais.forEach(material => {
        const novoMaterial = [
          obraId,
          payload.uf || '',
          payload.endereco || '',
          payload.numero || '',
          material.code || '',
          material.name || '',
          material.unit || '',
          material.quantity || 0,
          dataAtual
        ];
        materiaisSheet.appendRow(novoMaterial);
        
        // Decrementar do estoque
        decrementarEstoque(material.code, material.quantity);
      });
    }
    
    return { success: true, message: "Obra salva com sucesso", obraId: obraId };
  } catch (error) {
    return { error: error.message, stack: error.stack };
  }
}

function addMaterial(body) {
  try {
    const code = body.code;
    const name = body.name;
    const unit = body.unit;
    const category = body.category || 'Interno';
    
    if (!code || !name || !unit) {
      return { error: "Código, nome e unidade são obrigatórios" };
    }
    
    const sheet = getSheet(SHEET_NAMES.MATERIAIS);
    const data = sheet.getDataRange().getValues();
    
    // Verificar se material já existe
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === code) {
        return { error: "Material com este código já existe" };
      }
    }
    
    // Cabeçalho: SKU, Descrição, Unidade, Qtdd_Depósito, Categoria
    const novoMaterial = [
      code,
      name,
      unit,
      0,
      category
    ];
    
    sheet.appendRow(novoMaterial);
    
    return { success: true, ok: true, message: "Material adicionado com sucesso" };
  } catch (error) {
    return { error: error.message };
  }
}

function updateMaterial(body) {
  try {
    const sku = body.sku;
    const descricao = body.descricao;
    const unidade = body.unidade;
    const quantidade = body.quantidade;
    
    if (!sku) {
      return { error: "SKU é obrigatório" };
    }
    
    const sheet = getSheet(SHEET_NAMES.MATERIAIS);
    const data = sheet.getDataRange().getValues();
    
    // Cabeçalho: SKU, Descrição, Unidade, Qtdd_Depósito, Categoria
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === sku) {
        if (descricao !== undefined) sheet.getRange(i + 1, 2).setValue(descricao);
        if (unidade !== undefined) sheet.getRange(i + 1, 3).setValue(unidade);
        if (quantidade !== undefined) sheet.getRange(i + 1, 4).setValue(quantidade);
        
        return { success: true, ok: true, message: "Material atualizado com sucesso" };
      }
    }
    
    return { error: "Material não encontrado" };
  } catch (error) {
    return { error: error.message };
  }
}

function incrementMaterial(body) {
  try {
    const sku = body.sku;
    const delta = body.delta || 0;
    const motivo = body.motivo || '';
    
    if (!sku) {
      return { error: "SKU é obrigatório" };
    }
    
    const sheet = getSheet(SHEET_NAMES.MATERIAIS);
    const data = sheet.getDataRange().getValues();
    
    // Cabeçalho: SKU, Descrição, Unidade, Qtdd_Depósito, Categoria
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === sku) {
        const qtdAtual = data[i][3] || 0;
        const novaQtd = Math.max(0, qtdAtual + delta);
        
        sheet.getRange(i + 1, 4).setValue(novaQtd);
        
        // Log de movimentação (opcional - se quiser criar uma aba de histórico)
        registrarMovimentacao(sku, delta, motivo, qtdAtual, novaQtd);
        
        return { success: true, ok: true, newQty: novaQtd, message: "Quantidade atualizada com sucesso" };
      }
    }
    
    return { error: "Material não encontrado" };
  } catch (error) {
    return { error: error.message };
  }
}

function deleteMaterial(body) {
  try {
    const sku = body.sku;
    const motivo = body.motivo || '';
    
    if (!sku) {
      return { error: "SKU é obrigatório" };
    }
    
    const sheet = getSheet(SHEET_NAMES.MATERIAIS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === sku) {
        // Registrar exclusão antes de deletar
        registrarExclusao(sku, data[i][1], motivo);
        
        sheet.deleteRow(i + 1);
        return { success: true, ok: true, message: "Material excluído com sucesso" };
      }
    }
    
    return { error: "Material não encontrado" };
  } catch (error) {
    return { error: error.message };
  }
}

// ==================== FUNÇÕES AUXILIARES ====================

function decrementarEstoque(sku, quantidade) {
  try {
    const sheet = getSheet(SHEET_NAMES.MATERIAIS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === sku) {
        const qtdAtual = data[i][3] || 0;
        const novaQtd = Math.max(0, qtdAtual - quantidade);
        sheet.getRange(i + 1, 4).setValue(novaQtd);
        break;
      }
    }
  } catch (error) {
    Logger.log("Erro ao decrementar estoque: " + error.message);
  }
}

function registrarMovimentacao(sku, delta, motivo, qtdAnterior, qtdNova) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let logSheet = spreadsheet.getSheetByName('Log_Movimentacoes');
    
    if (!logSheet) {
      logSheet = spreadsheet.insertSheet('Log_Movimentacoes');
      logSheet.appendRow(['Data', 'SKU', 'Delta', 'Qtd_Anterior', 'Qtd_Nova', 'Motivo']);
    }
    
    logSheet.appendRow([
      new Date(),
      sku,
      delta,
      qtdAnterior,
      qtdNova,
      motivo
    ]);
  } catch (error) {
    Logger.log("Erro ao registrar movimentação: " + error.message);
  }
}

function registrarExclusao(sku, descricao, motivo) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let logSheet = spreadsheet.getSheetByName('Log_Exclusoes');
    
    if (!logSheet) {
      logSheet = spreadsheet.insertSheet('Log_Exclusoes');
      logSheet.appendRow(['Data', 'SKU', 'Descrição', 'Motivo', 'Usuario']);
    }
    
    logSheet.appendRow([
      new Date(),
      sku,
      descricao,
      motivo,
      Session.getActiveUser().getEmail()
    ]);
  } catch (error) {
    Logger.log("Erro ao registrar exclusão: " + error.message);
  }
}

function getSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Aba '${sheetName}' não encontrada`);
  return sheet;
}

// Função para criar resposta com headers CORS
function createCORSResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type')
    .setHeader('Access-Control-Max-Age', '3600');
}

// Função legada para compatibilidade
function createResponse(data) {
  return createCORSResponse(data);
}
