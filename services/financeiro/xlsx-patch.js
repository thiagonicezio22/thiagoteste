// xlsx-patch.js — motor de leitura e patch cirurgico de xlsx armazenado como zip STORE (sem compressao).
// Zero dependencias: apenas Buffer. Sem zlib, sem fs no codigo de producao.
// Estrategia: o arquivo xlsx e um zip STORE; parseamos o central directory, lemos o XML da
// sheet alvo como texto, aplicamos edicoes pontuais preservando tudo (estilos, formulas,
// atributos de row) e remontamos o zip copiando byte a byte todas as entradas nao alteradas.
'use strict';

// ---------------------------------------------------------------------------
// CRC32 (tabela padrao, polinomio 0xEDB88320)
// ---------------------------------------------------------------------------
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// ---------------------------------------------------------------------------
// Parser de zip STORE via End of Central Directory + central directory
// ---------------------------------------------------------------------------
const SIG_EOCD = 0x06054b50;
const SIG_CENTRAL = 0x02014b50;
const SIG_LOCAL = 0x04034b50;

function acharEocd(buf) {
  // EOCD tem 22 bytes fixos + comentario de ate 65535 bytes; varre de tras pra frente
  const minimo = Math.max(0, buf.length - 22 - 65535);
  for (let i = buf.length - 22; i >= minimo; i--) {
    if (buf.readUInt32LE(i) === SIG_EOCD) return i;
  }
  throw new Error('zip invalido: End of Central Directory nao encontrado');
}

// Parseia o zip inteiro. Retorna entradas na ordem do central directory, com offsets
// suficientes para copia byte a byte na remontagem.
function parseZip(buf) {
  const eocdOffset = acharEocd(buf);
  const totalEntradas = buf.readUInt16LE(eocdOffset + 10);
  const cdOffset = buf.readUInt32LE(eocdOffset + 16);
  const entradas = [];
  let p = cdOffset;
  for (let i = 0; i < totalEntradas; i++) {
    if (buf.readUInt32LE(p) !== SIG_CENTRAL) {
      throw new Error('zip invalido: assinatura do central directory ausente na entrada ' + i);
    }
    const metodo = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const uncompSize = buf.readUInt32LE(p + 24);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const lho = buf.readUInt32LE(p + 42);
    const nome = buf.toString('utf8', p + 46, p + 46 + nameLen);
    if (metodo !== 0) {
      throw new Error(`arquivo nao esta em formato STORE (entrada '${nome}' usa compressao metodo ${metodo})`);
    }
    if (buf.readUInt32LE(lho) !== SIG_LOCAL) {
      throw new Error(`zip invalido: local header ausente para '${nome}'`);
    }
    const lNameLen = buf.readUInt16LE(lho + 26);
    const lExtraLen = buf.readUInt16LE(lho + 28);
    const dataOffset = lho + 30 + lNameLen + lExtraLen;
    entradas.push({
      nome,
      lho, // offset do local header
      dataOffset,
      compSize,
      uncompSize,
      centralOffset: p,
      centralLength: 46 + nameLen + extraLen + commentLen,
    });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return { entradas, eocdOffset };
}

// API 1: Map nomeEntrada -> {offset, tamanho, buffer}
function lerEntradas(buf) {
  const { entradas } = parseZip(buf);
  const mapa = new Map();
  for (const e of entradas) {
    mapa.set(e.nome, {
      offset: e.dataOffset,
      tamanho: e.uncompSize,
      buffer: buf.subarray(e.dataOffset, e.dataOffset + e.compSize),
    });
  }
  return mapa;
}

// Remonta o zip trocando SOMENTE a entrada nomeAlterado; o resto e copiado byte a byte.
function reconstruirZip(buf, nomeAlterado, novoDado) {
  const { entradas, eocdOffset } = parseZip(buf);
  if (!entradas.some((e) => e.nome === nomeAlterado)) {
    throw new Error(`entrada '${nomeAlterado}' nao existe no zip`);
  }
  const novoCrc = crc32(novoDado);
  const partes = [];
  let off = 0;

  // locais na ordem fisica original do arquivo
  const ordemLocal = entradas.slice().sort((a, b) => a.lho - b.lho);
  const novosOffsets = new Map();
  for (const e of ordemLocal) {
    novosOffsets.set(e.nome, off);
    if (e.nome === nomeAlterado) {
      // copia o local header original (com nome e extra) e corrige crc/tamanhos
      const lh = Buffer.from(buf.subarray(e.lho, e.dataOffset));
      lh.writeUInt16LE(lh.readUInt16LE(6) & ~0x08, 6); // garante bit 3 (data descriptor) desligado
      lh.writeUInt32LE(novoCrc, 14);
      lh.writeUInt32LE(novoDado.length, 18);
      lh.writeUInt32LE(novoDado.length, 22);
      partes.push(lh, novoDado);
      off += lh.length + novoDado.length;
    } else {
      const raw = buf.subarray(e.lho, e.dataOffset + e.compSize);
      partes.push(raw);
      off += raw.length;
    }
  }

  // central directory na ordem original, corrigindo offsets (e crc/tamanhos da alterada)
  const cdStart = off;
  for (const e of entradas) {
    const raw = Buffer.from(buf.subarray(e.centralOffset, e.centralOffset + e.centralLength));
    raw.writeUInt32LE(novosOffsets.get(e.nome), 42);
    if (e.nome === nomeAlterado) {
      raw.writeUInt16LE(raw.readUInt16LE(8) & ~0x08, 8);
      raw.writeUInt32LE(novoCrc, 16);
      raw.writeUInt32LE(novoDado.length, 20);
      raw.writeUInt32LE(novoDado.length, 24);
    }
    partes.push(raw);
    off += raw.length;
  }

  // EOCD original (inclusive comentario), corrigindo tamanho e offset do central directory
  const eocd = Buffer.from(buf.subarray(eocdOffset));
  eocd.writeUInt32LE(off - cdStart, 12);
  eocd.writeUInt32LE(cdStart, 16);
  partes.push(eocd);
  return Buffer.concat(partes);
}

// ---------------------------------------------------------------------------
// Helpers de XML (parsing por texto — os XML de sheet sao previsiveis)
// ---------------------------------------------------------------------------
function decodificarEntidades(s) {
  return s.replace(/&(#x[0-9a-fA-F]+|#\d+|amp|lt|gt|quot|apos);/g, (m, g) => {
    if (g === 'amp') return '&';
    if (g === 'lt') return '<';
    if (g === 'gt') return '>';
    if (g === 'quot') return '"';
    if (g === 'apos') return "'";
    const cp = g[1] === 'x' ? parseInt(g.slice(2), 16) : parseInt(g.slice(1), 10);
    return String.fromCodePoint(cp);
  });
}

function escaparXml(s) {
  const txt = String(s);
  // caracteres de controle ilegais em XML 1.0 corromperiam a sheet inteira; melhor falhar alto
  const ilegal = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/.exec(txt);
  if (ilegal) {
    const cp = ilegal[0].codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
    throw new Error(`texto contem caractere U+${cp}, invalido em XML — remova-o antes de gravar`);
  }
  return txt
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Le um atributo de uma tag ja isolada (ex: getAttr('<c r="A1" s="2">', 'r') -> 'A1')
function getAttr(tag, nome) {
  const escapado = nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp('\\s' + escapado + '="([^"]*)"').exec(tag);
  return m ? m[1] : null;
}

// ---------------------------------------------------------------------------
// Referencias de celula (A1) e ranges
// ---------------------------------------------------------------------------
function colParaNumero(letras) {
  let n = 0;
  for (let i = 0; i < letras.length; i++) n = n * 26 + (letras.charCodeAt(i) - 64);
  return n;
}

function numeroParaCol(n) {
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function parseRef(ref) {
  const m = /^([A-Z]+)(\d+)$/.exec(String(ref).toUpperCase());
  if (!m) throw new Error(`referencia de celula invalida: '${ref}'`);
  return { col: m[1], colNum: colParaNumero(m[1]), linha: parseInt(m[2], 10) };
}

// Aceita 'A12', 'A12:G71' ou lista mista; devolve lista de refs individuais
function expandirRefs(refs) {
  const lista = Array.isArray(refs) ? refs : [refs];
  const saida = [];
  for (const item of lista) {
    const txt = String(item).toUpperCase();
    if (txt.includes(':')) {
      const [ini, fim] = txt.split(':');
      const a = parseRef(ini);
      const b = parseRef(fim);
      for (let l = Math.min(a.linha, b.linha); l <= Math.max(a.linha, b.linha); l++) {
        for (let c = Math.min(a.colNum, b.colNum); c <= Math.max(a.colNum, b.colNum); c++) {
          saida.push(numeroParaCol(c) + l);
        }
      }
    } else {
      saida.push(parseRef(txt).col + parseRef(txt).linha);
    }
  }
  return saida;
}

// ---------------------------------------------------------------------------
// Datas: serial Excel (epoch 1899-12-30, ja compensando o bug do ano 1900)
// ---------------------------------------------------------------------------
function dataParaSerial(txt) {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(txt).trim());
  if (!m) throw new Error(`data invalida: '${txt}' (esperado DD/MM/AAAA)`);
  const dia = parseInt(m[1], 10);
  const mes = parseInt(m[2], 10);
  const ano = parseInt(m[3], 10);
  const ms = Date.UTC(ano, mes - 1, dia);
  // valida componentes (ex: 31/02 viraria 02/03)
  const d = new Date(ms);
  if (d.getUTCDate() !== dia || d.getUTCMonth() !== mes - 1 || d.getUTCFullYear() !== ano) {
    throw new Error(`data inexistente: '${txt}'`);
  }
  // dias desde 1970-01-01 + 25569 = dias desde 1899-12-30 (verificado: 01/01/1970 = 25569)
  let serial = Math.round(ms / 86400000) + 25569;
  // bug do ano 1900 do Excel: o serial 60 e o inexistente 29/02/1900, entao datas
  // reais anteriores a 01/03/1900 ficam 1 dia abaixo da contagem a partir de 1899-12-30
  if (ms < Date.UTC(1900, 2, 1)) serial -= 1;
  if (serial < 1) throw new Error(`data fora da faixa do Excel: '${txt}' (minimo 01/01/1900)`);
  return serial;
}

// ---------------------------------------------------------------------------
// Resolucao de aba -> caminho da sheet no zip
// ---------------------------------------------------------------------------
function lerXmlEntrada(entradas, nome) {
  const e = entradas.get(nome);
  if (!e) throw new Error(`entrada '${nome}' nao encontrada no xlsx`);
  return e.buffer.toString('utf8');
}

function resolverAba(buf, nomeAba) {
  const entradas = lerEntradas(buf);
  const workbook = lerXmlEntrada(entradas, 'xl/workbook.xml');
  const rels = lerXmlEntrada(entradas, 'xl/_rels/workbook.xml.rels');

  // acha o r:id da aba pelo nome (nomes podem ter acentos como UTF-8 direto ou entidades &#NNN;)
  let rid = null;
  const disponiveis = [];
  const reSheet = /<sheet\b[^>]*\/?>/g;
  let m;
  while ((m = reSheet.exec(workbook)) !== null) {
    const nome = decodificarEntidades(getAttr(m[0], 'name') || '');
    disponiveis.push(nome);
    if (nome === nomeAba) {
      rid = getAttr(m[0], 'r:id');
      break;
    }
  }
  if (!rid) {
    throw new Error(`aba '${nomeAba}' nao encontrada (abas: ${disponiveis.join(', ')})`);
  }

  // acha o Target da relationship com aquele Id
  const reRel = /<Relationship\b[^>]*\/?>/g;
  while ((m = reRel.exec(rels)) !== null) {
    if (getAttr(m[0], 'Id') === rid) {
      let alvo = decodificarEntidades(getAttr(m[0], 'Target') || '');
      // Target pode ser relativo a xl/ ('worksheets/sheet3.xml') ou absoluto ('/xl/worksheets/sheet1.xml')
      if (alvo.startsWith('/')) alvo = alvo.slice(1);
      else alvo = 'xl/' + alvo;
      return alvo;
    }
  }
  throw new Error(`relationship '${rid}' da aba '${nomeAba}' nao encontrada em workbook.xml.rels`);
}

// ---------------------------------------------------------------------------
// Shared strings
// ---------------------------------------------------------------------------
function lerSharedStrings(entradas) {
  const e = entradas.get('xl/sharedStrings.xml');
  if (!e) return [];
  const xml = e.buffer.toString('utf8');
  const strings = [];
  const reSi = /<si\b[^>]*(?:\/>|>([\s\S]*?)<\/si>)/g;
  let m;
  while ((m = reSi.exec(xml)) !== null) {
    const corpo = m[1] || '';
    // concatena todos os <t> (texto simples ou rich text em varios runs)
    let texto = '';
    const reT = /<t\b[^>]*(?:\/>|>([\s\S]*?)<\/t>)/g;
    let t;
    while ((t = reT.exec(corpo)) !== null) texto += decodificarEntidades(t[1] || '');
    strings.push(texto);
  }
  return strings;
}

// ---------------------------------------------------------------------------
// Leitura de celulas
// ---------------------------------------------------------------------------
const RE_CELULA = /<c\b[^>]*\/>|<c\b[^>]*>[\s\S]*?<\/c>/g;
const RE_ROW = /<row\b[^>]*\/>|<row\b[^>]*>[\s\S]*?<\/row>/g;

// Separa a tag de abertura e o conteudo interno de uma celula
function abrirCelula(celXml) {
  if (celXml.endsWith('/>')) {
    return { abre: celXml, corpo: '' };
  }
  const fim = celXml.indexOf('>');
  return { abre: celXml.slice(0, fim + 1), corpo: celXml.slice(fim + 1, celXml.lastIndexOf('</c>')) };
}

function extrairV(corpo) {
  const m = /<v\b[^>]*(?:\/>|>([\s\S]*?)<\/v>)/.exec(corpo);
  return m ? decodificarEntidades(m[1] || '') : null;
}

function interpretarCelula(celXml, shared) {
  const { abre, corpo } = abrirCelula(celXml);
  const t = getAttr(abre, 't');

  const mF = /<f\b[^>]*(?:\/>|>([\s\S]*?)<\/f>)/.exec(corpo);
  if (mF) {
    const vTxt = extrairV(corpo);
    let valorCache = vTxt;
    if (vTxt !== null && vTxt !== '' && t !== 'str' && t !== 's' && t !== 'inlineStr') {
      const n = Number(vTxt);
      if (!Number.isNaN(n)) valorCache = n;
    }
    return { tipo: 'formula', formula: decodificarEntidades(mF[1] || ''), valorCache, valor: valorCache };
  }

  if (t === 's') {
    const idx = parseInt(extrairV(corpo), 10);
    return { tipo: 'texto', valor: shared[idx] !== undefined ? shared[idx] : null };
  }
  if (t === 'inlineStr' || corpo.includes('<is')) {
    let texto = '';
    const reT = /<t\b[^>]*(?:\/>|>([\s\S]*?)<\/t>)/g;
    let m;
    while ((m = reT.exec(corpo)) !== null) texto += decodificarEntidades(m[1] || '');
    return { tipo: 'texto', valor: texto };
  }
  if (t === 'str') {
    const vTxt = extrairV(corpo);
    return { tipo: 'texto', valor: vTxt === null ? '' : vTxt };
  }
  if (t === 'b') {
    return { tipo: 'bool', valor: extrairV(corpo) === '1' };
  }
  const vTxt = extrairV(corpo);
  if (vTxt === null || vTxt === '') return { tipo: 'vazia', valor: null };
  return { tipo: 'numero', valor: Number(vTxt) };
}

function lerCelulas(buf, nomeAba, refs) {
  const entradas = lerEntradas(buf);
  const caminho = resolverAba(buf, nomeAba);
  const xml = lerXmlEntrada(entradas, caminho);
  const shared = lerSharedStrings(entradas);
  const alvo = new Set(expandirRefs(refs));
  const resultado = {};

  RE_ROW.lastIndex = 0;
  let mRow;
  while ((mRow = RE_ROW.exec(xml)) !== null) {
    const rowXml = mRow[0];
    RE_CELULA.lastIndex = 0;
    let mCel;
    while ((mCel = RE_CELULA.exec(rowXml)) !== null) {
      const r = getAttr(abrirCelula(mCel[0]).abre, 'r');
      if (r && alvo.has(r)) resultado[r] = interpretarCelula(mCel[0], shared);
    }
  }
  return resultado;
}

// ---------------------------------------------------------------------------
// Patch de celulas
// ---------------------------------------------------------------------------
function serializarCelula(ref, sAttr, tipo, valor) {
  const s = sAttr !== null && sAttr !== undefined ? ` s="${sAttr}"` : '';
  if (tipo === 'texto') {
    return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${escaparXml(valor)}</t></is></c>`;
  }
  let num;
  if (tipo === 'data') {
    num = dataParaSerial(valor);
  } else if (tipo === 'numero') {
    num = Number(valor);
    if (!Number.isFinite(num)) throw new Error(`valor numerico invalido para ${ref}: '${valor}'`);
  } else {
    throw new Error(`tipo de escrita desconhecido: '${tipo}' (use numero, texto ou data)`);
  }
  return `<c r="${ref}"${s}><v>${num}</v></c>`;
}

// Coleta os ranges de formulas compartilhadas (<f t="shared" ref="A1:A9">) da sheet.
// FURO CLASSICO: uma celula pode ser coberta pelo ref de formula compartilhada de OUTRA
// celula sem ter <f> propria (ou nem existir no XML) — checar so o <f> da celula alvo
// nao basta para proteger formulas.
function coletarRangesCompartilhados(xml) {
  const ranges = [];
  const re = /<f\b[^>]*\bt="shared"[^>]*>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const ref = getAttr(m[0], 'ref');
    if (!ref) continue; // seguidora (so si=), sem range proprio
    const [ini, fim] = ref.includes(':') ? ref.split(':') : [ref, ref];
    const a = parseRef(ini);
    const b = parseRef(fim);
    ranges.push({
      ref,
      c1: Math.min(a.colNum, b.colNum), c2: Math.max(a.colNum, b.colNum),
      l1: Math.min(a.linha, b.linha), l2: Math.max(a.linha, b.linha),
    });
  }
  return ranges;
}

// Aplica uma escrita dentro do XML de <sheetData>...</sheetData>; retorna o novo trecho
function aplicarEscrita(sheetData, escrita) {
  const { ref, valor, tipo } = escrita;
  const { colNum, linha } = parseRef(ref);
  const refNorm = numeroParaCol(colNum) + linha;

  // localiza a row alvo (e o ponto de insercao caso nao exista). Varre TODAS as rows
  // sem parar na primeira maior: rows fora de ordem no XML sao raras porem legais, e um
  // break precoce criaria uma row duplicada (corrupcao).
  RE_ROW.lastIndex = 0;
  let mRow;
  let alvo = null;
  let insercaoRow = -1;
  while ((mRow = RE_ROW.exec(sheetData)) !== null) {
    const rAttr = getAttr(mRow[0].slice(0, mRow[0].indexOf('>') + 1), 'r');
    if (rAttr === null) {
      throw new Error('sheet possui <row> sem atributo r (numeracao implicita): fora do padrao suportado, patch abortado');
    }
    const rNum = parseInt(rAttr, 10);
    if (rNum === linha) {
      alvo = { xml: mRow[0], ini: mRow.index };
      break;
    }
    if (rNum > linha && insercaoRow < 0) insercaoRow = mRow.index;
  }

  if (!alvo) {
    // row inexistente: cria nova so com r= e insere em ordem entre as existentes
    const novaRow = `<row r="${linha}">${serializarCelula(refNorm, null, tipo, valor)}</row>`;
    if (insercaoRow >= 0) {
      return sheetData.slice(0, insercaoRow) + novaRow + sheetData.slice(insercaoRow);
    }
    const fecha = sheetData.lastIndexOf('</sheetData>');
    if (fecha >= 0) return sheetData.slice(0, fecha) + novaRow + sheetData.slice(fecha);
    // sheetData auto-fechada (<sheetData/>)
    return sheetData.replace(/<sheetData\b([^>]*)\/>/, `<sheetData$1>${novaRow}</sheetData>`);
  }

  // row existe: normaliza para forma aberta preservando atributos (spans, ht, customHeight, s...)
  let rowXml = alvo.xml;
  if (rowXml.endsWith('/>') && !rowXml.includes('</row>')) {
    rowXml = rowXml.slice(0, -2) + '></row>';
  }

  // procura a celula na row. Varre TODAS as celulas (podem estar fora de ordem de coluna);
  // celula sem r= usa posicao implicita — inserir no meio deslocaria as seguintes, entao aborta.
  RE_CELULA.lastIndex = 0;
  let mCel;
  let celAlvo = null;
  let insercaoCel = -1;
  while ((mCel = RE_CELULA.exec(rowXml)) !== null) {
    const { abre } = abrirCelula(mCel[0]);
    const rCel = getAttr(abre, 'r');
    if (!rCel) {
      throw new Error(`row ${linha} possui celula sem atributo r (posicao implicita): fora do padrao suportado, patch abortado`);
    }
    const pr = parseRef(rCel);
    if (pr.colNum === colNum) {
      celAlvo = { xml: mCel[0], ini: mCel.index, abre };
      break;
    }
    if (pr.colNum > colNum && insercaoCel < 0) insercaoCel = mCel.index;
  }

  let novaRowXml;
  if (celAlvo) {
    // regra de ouro: nunca sobrescrever formula
    if (/<f[\s>/]/.test(celAlvo.xml)) {
      throw new Error(`celula tem formula: ${refNorm} nao pode ser sobrescrita`);
    }
    const sAttr = getAttr(celAlvo.abre, 's'); // preserva estilo mesmo em celula vazia
    const nova = serializarCelula(refNorm, sAttr, tipo, valor);
    novaRowXml = rowXml.slice(0, celAlvo.ini) + nova + rowXml.slice(celAlvo.ini + celAlvo.xml.length);
  } else {
    // celula inexistente: insere em ordem de coluna
    const nova = serializarCelula(refNorm, null, tipo, valor);
    if (insercaoCel >= 0) {
      novaRowXml = rowXml.slice(0, insercaoCel) + nova + rowXml.slice(insercaoCel);
    } else {
      const fecha = rowXml.lastIndexOf('</row>');
      novaRowXml = rowXml.slice(0, fecha) + nova + rowXml.slice(fecha);
    }
  }

  return sheetData.slice(0, alvo.ini) + novaRowXml + sheetData.slice(alvo.ini + alvo.xml.length);
}

function patchCelulas(buf, nomeAba, escritas) {
  if (!Array.isArray(escritas) || escritas.length === 0) {
    throw new Error('escritas deve ser uma lista nao vazia de {ref, valor, tipo}');
  }
  const entradas = lerEntradas(buf);
  const caminho = resolverAba(buf, nomeAba);
  const xml = lerXmlEntrada(entradas, caminho);

  const ini = xml.indexOf('<sheetData');
  if (ini < 0) throw new Error(`sheet '${caminho}' sem <sheetData>`);
  let fim;
  const fechaTag = xml.indexOf('</sheetData>', ini);
  if (fechaTag >= 0) {
    fim = fechaTag + '</sheetData>'.length;
  } else {
    fim = xml.indexOf('>', ini) + 1; // <sheetData/> auto-fechada
  }

  let sheetData = xml.slice(ini, fim);

  // protecao de formulas compartilhadas: o ref de um <f t="shared"> de outra celula pode
  // cobrir a celula alvo mesmo que ela nao tenha <f> propria (ou nem exista no XML)
  const rangesShared = coletarRangesCompartilhados(sheetData);
  for (const escrita of escritas) {
    const p = parseRef(escrita.ref);
    for (const rg of rangesShared) {
      if (p.colNum >= rg.c1 && p.colNum <= rg.c2 && p.linha >= rg.l1 && p.linha <= rg.l2) {
        throw new Error(`celula tem formula: ${p.col + p.linha} esta no range '${rg.ref}' de formula compartilhada e nao pode ser sobrescrita`);
      }
    }
  }

  for (const escrita of escritas) {
    sheetData = aplicarEscrita(sheetData, escrita);
  }

  const novoXml = xml.slice(0, ini) + sheetData + xml.slice(fim);
  return reconstruirZip(buf, caminho, Buffer.from(novoXml, 'utf8'));
}

// ---------------------------------------------------------------------------
// Primeira linha vazia numa coluna chave
// ---------------------------------------------------------------------------
function primeiraLinhaVazia(buf, nomeAba, colunaChave, linhaIni, linhaFim) {
  const col = String(colunaChave).toUpperCase();
  const refs = [];
  for (let l = linhaIni; l <= linhaFim; l++) refs.push(col + l);
  const celulas = lerCelulas(buf, nomeAba, refs);
  for (let l = linhaIni; l <= linhaFim; l++) {
    const c = celulas[col + l];
    // vazia = celula ausente, sem valor, ou texto em branco; formula conta como ocupada
    if (!c || c.tipo === 'vazia' || (c.tipo === 'texto' && String(c.valor).trim() === '')) {
      return l;
    }
  }
  return null;
}

module.exports = { lerEntradas, resolverAba, lerCelulas, patchCelulas, primeiraLinhaVazia, dataParaSerial };

// ---------------------------------------------------------------------------
// Harness de teste (roda com: node xlsx-patch.js) — usa fs/child_process SO aqui
// ---------------------------------------------------------------------------
if (require.main === module) {
  const fs = require('fs');
  const path = require('path');
  const { spawnSync } = require('child_process');

  const DIR = process.env.FIN_DIR ||
    '/tmp/claude-0/-home-user-thiagoteste/46e0e517-f29e-5e6f-b738-f2e0a8076033/scratchpad/fin';

  let falhas = 0;
  function ok(cond, rotulo, detalhe) {
    if (cond) console.log(`  PASS ${rotulo}${detalhe ? ' — ' + detalhe : ''}`);
    else { falhas++; console.log(`  FAIL ${rotulo}${detalhe ? ' — ' + detalhe : ''}`); }
  }
  function carregar(nome) { return fs.readFileSync(path.join(DIR, nome)); }
  function rodarPython(codigo) {
    const r = spawnSync('python3', ['-'], { input: codigo, encoding: 'utf8' });
    return { out: (r.stdout || '').trim(), err: (r.stderr || '').trim(), status: r.status };
  }

  console.log('== Testes xlsx-patch ==');

  // --- datas: aritmetica do serial Excel
  console.log('[datas]');
  ok(dataParaSerial('01/01/1970') === 25569, 'serial 01/01/1970 = 25569', String(dataParaSerial('01/01/1970')));
  // 24/07/2026 = 46227 (confirmado pelo proprio arquivo real: B30 do lojao = 46212 = 09/07/2026,
  // e openpyxl le o serial gravado como a data certa). O exemplo "46237" da spec estava errado.
  ok(dataParaSerial('24/07/2026') === 46227, 'serial 24/07/2026 = 46227', String(dataParaSerial('24/07/2026')));
  ok(dataParaSerial('28/07/2026') === 46231, 'serial 28/07/2026 = 46231', String(dataParaSerial('28/07/2026')));
  // regiao do bug do ano 1900: Excel tem serial 60 = 29/02/1900 (inexistente)
  ok(dataParaSerial('01/01/1900') === 1, 'serial 01/01/1900 = 1', String(dataParaSerial('01/01/1900')));
  ok(dataParaSerial('28/02/1900') === 59, 'serial 28/02/1900 = 59', String(dataParaSerial('28/02/1900')));
  ok(dataParaSerial('01/03/1900') === 61, 'serial 01/03/1900 = 61 (pula o 60 fantasma)', String(dataParaSerial('01/03/1900')));
  try {
    dataParaSerial('30/12/1899');
    ok(false, '30/12/1899 (pre-Excel) deveria falhar');
  } catch (e) {
    ok(e.message.includes('faixa'), 'erro esperado para data pre-1900', e.message);
  }
  try {
    dataParaSerial('29/02/1900');
    ok(false, '29/02/1900 (data inexistente) deveria falhar');
  } catch (e) {
    ok(e.message.includes('inexistente'), 'erro esperado para 29/02/1900', e.message);
  }

  // --- zip: STORE parseia; deflate rejeita com erro claro
  console.log('[zip]');
  const bufLojao = carregar('lojao.store.xlsx');
  const bufHorizon = carregar('horizon.store.xlsx');
  const bufObras = carregar('controle-obras.store.xlsx');
  const bufEpdm = carregar('epdm-antigo.store.xlsx');
  for (const [nome, b] of [['lojao', bufLojao], ['horizon', bufHorizon], ['controle-obras', bufObras], ['epdm-antigo', bufEpdm]]) {
    const ents = lerEntradas(b);
    ok(ents.has('xl/workbook.xml'), `lerEntradas ${nome}.store`, `${ents.size} entradas`);
  }
  try {
    lerEntradas(carregar('lojao.xlsx'));
    ok(false, 'lerEntradas em xlsx comprimido deve falhar');
  } catch (e) {
    ok(e.message.includes('STORE'), 'erro claro para xlsx comprimido', e.message);
  }

  // --- resolverAba com acentos/espacos
  console.log('[resolverAba]');
  ok(resolverAba(bufLojao, 'VENDAS') === 'xl/worksheets/sheet3.xml', 'lojao VENDAS (Target absoluto /xl/...)', resolverAba(bufLojao, 'VENDAS'));
  ok(resolverAba(bufHorizon, 'Aportes Sócios') === 'xl/worksheets/sheet3.xml', "horizon 'Aportes Sócios'", resolverAba(bufHorizon, 'Aportes Sócios'));
  ok(resolverAba(bufObras, 'RJ Maricá') === 'xl/worksheets/sheet4.xml', "controle-obras 'RJ Maricá'", resolverAba(bufObras, 'RJ Maricá'));

  // --- (a) lerCelulas em ranges conhecidos
  console.log('[a. lerCelulas]');
  const vendas = lerCelulas(bufLojao, 'VENDAS', 'A12:G31');
  ok(vendas.A12 && vendas.A12.tipo === 'numero' && vendas.A12.valor === 1, 'lojao A12 = 1', JSON.stringify(vendas.A12));
  ok(vendas.A30 && vendas.A30.valor === 19, 'lojao A30 = 19', JSON.stringify(vendas.A30));
  ok(vendas.B30 && vendas.B30.tipo === 'numero' && vendas.B30.valor === 46212, 'lojao B30 serial 46212 (09/07/2026)', JSON.stringify(vendas.B30));
  ok(vendas.C30 && vendas.C30.tipo === 'texto' && vendas.C30.valor === '2000017343244948', 'lojao C30 inlineStr', JSON.stringify(vendas.C30));
  ok(vendas.D30 && vendas.D30.valor === 'GERADOR DE OZÔNIO', 'lojao D30 com entidade &#212; decodificada', JSON.stringify(vendas.D30));
  ok(vendas.G30 && vendas.G30.valor === 2274.6, 'lojao G30 = 2274.6', JSON.stringify(vendas.G30));
  ok(vendas.A31 && vendas.A31.tipo === 'vazia', 'lojao A31 vazia', JSON.stringify(vendas.A31));
  const linhasPreenchidas = [];
  for (let l = 12; l <= 31; l++) if (vendas['A' + l] && vendas['A' + l].tipo !== 'vazia') linhasPreenchidas.push(l);
  ok(linhasPreenchidas.length === 19 && linhasPreenchidas[18] === 30, 'lojao preenchido 12..30', `linhas ${linhasPreenchidas[0]}..${linhasPreenchidas[18]}`);

  const aportes = lerCelulas(bufHorizon, 'Aportes Sócios', 'A12:E23');
  ok(aportes.A12 && aportes.A12.valor === 46156, 'horizon A12 serial 46156 (14/05/2026)', JSON.stringify(aportes.A12));
  ok(aportes.B12 && aportes.B12.tipo === 'texto' && aportes.B12.valor === 'Thiago', 'horizon B12 sharedString = Thiago', JSON.stringify(aportes.B12));
  ok(aportes.B22 && aportes.B22.valor === 'André', 'horizon B22 sharedString = André (UTF-8)', JSON.stringify(aportes.B22));
  ok(aportes.E23 && aportes.E23.valor === 2400, 'horizon E23 = 2400', JSON.stringify(aportes.E23));
  const formulaF = lerCelulas(bufHorizon, 'Aportes Sócios', ['F23']);
  ok(formulaF.F23 && formulaF.F23.tipo === 'formula' && formulaF.F23.formula.includes('SUM($E$12:E23)') && formulaF.F23.valorCache === 94401,
    'horizon F23 formula + valorCache', JSON.stringify(formulaF.F23));

  // --- (b) primeiraLinhaVazia
  console.log('[b. primeiraLinhaVazia]');
  const plvLojao = primeiraLinhaVazia(bufLojao, 'VENDAS', 'A', 12, 71);
  ok(plvLojao === 31, 'lojao VENDAS col A 12..71 -> 31', String(plvLojao));
  const plvHorizon = primeiraLinhaVazia(bufHorizon, 'Aportes Sócios', 'A', 12, 61);
  ok(plvHorizon === 24, 'horizon Aportes col A 12..61 -> 24', String(plvHorizon));

  // --- (c) patch lojao linha 31 (venda completa)
  console.log('[c. patch lojao linha 31]');
  const lojaoPatch = patchCelulas(bufLojao, 'VENDAS', [
    { ref: 'A31', valor: 20, tipo: 'numero' },
    { ref: 'B31', valor: '28/07/2026', tipo: 'data' },
    { ref: 'C31', valor: '2000017343244948', tipo: 'texto' },
    { ref: 'D31', valor: 'GERADOR DE OZONIO', tipo: 'texto' },
    { ref: 'E31', valor: 15000, tipo: 'numero' },
    { ref: 'F31', valor: 3885, tipo: 'numero' },
    { ref: 'G31', valor: 3215.63, tipo: 'numero' },
  ]);
  const lojaoPatchPath = path.join(DIR, 'lojao.patched.xlsx');
  fs.writeFileSync(lojaoPatchPath, lojaoPatch);
  const relido = lerCelulas(lojaoPatch, 'VENDAS', 'A31:H31');
  ok(relido.A31.valor === 20 && relido.B31.valor === 46231 && relido.G31.valor === 3215.63, 'releitura A31/B31/G31', JSON.stringify([relido.A31, relido.B31, relido.G31]));
  ok(relido.H31 && relido.H31.tipo === 'formula', 'H31 continua formula apos patch', JSON.stringify(relido.H31 && relido.H31.formula));
  const antesS = lerCelulas(bufLojao, 'VENDAS', ['B31']);
  // estilo preservado: valida via openpyxl abaixo (B31 deve sair como DATA formatada)
  ok(antesS.B31.tipo === 'vazia', 'B31 era vazia antes do patch', JSON.stringify(antesS.B31));

  const valLojao = rodarPython(`
import warnings, datetime, openpyxl
with warnings.catch_warnings(record=True) as ws_:
    warnings.simplefilter('always')
    wb = openpyxl.load_workbook(r'${lojaoPatchPath}', data_only=False)
v = wb['VENDAS']
print('B31', repr(v['B31'].value))
print('B31_is_date', isinstance(v['B31'].value, datetime.datetime) and v['B31'].value.date() == datetime.date(2026,7,28))
print('A31', v['A31'].value); print('C31', repr(v['C31'].value)); print('D31', repr(v['D31'].value))
print('E31', v['E31'].value); print('F31', v['F31'].value); print('G31', v['G31'].value)
print('H31_f', repr(v['H31'].value)); print('L31_f', repr(v['L31'].value))
print('B31_fmt', v['B31'].number_format)
`);
  ok(valLojao.status === 0 && valLojao.out.includes('B31_is_date True'), 'openpyxl: B31 e DATA 28/07/2026', valLojao.out.split('\n').find((l) => l.startsWith('B31 ')));
  ok(valLojao.out.includes("C31 '2000017343244948'") && valLojao.out.includes('E31 15000') && valLojao.out.includes('G31 3215.63'), 'openpyxl: valores C/E/F/G corretos');
  ok(valLojao.out.includes("H31_f '=IF(OR(F31") && valLojao.out.includes("L31_f '=IF(B31"), 'openpyxl: formulas H31/L31 intactas (linha 31 JA tinha formulas H-L)');
  console.log('    (openpyxl) ' + valLojao.out.replace(/\n/g, '\n    (openpyxl) '));

  // --- (d) patch horizon linha 24 (aporte)
  console.log('[d. patch horizon linha 24]');
  const horizonPatch = patchCelulas(bufHorizon, 'Aportes Sócios', [
    { ref: 'A24', valor: '24/07/2026', tipo: 'data' },
    { ref: 'B24', valor: 'André', tipo: 'texto' },
    { ref: 'C24', valor: 'Aporte de teste — motor xlsx-patch', tipo: 'texto' },
    { ref: 'D24', valor: 'PIX', tipo: 'texto' },
    { ref: 'E24', valor: 5000, tipo: 'numero' },
  ]);
  const horizonPatchPath = path.join(DIR, 'horizon.patched.xlsx');
  fs.writeFileSync(horizonPatchPath, horizonPatch);
  const plvDepois = primeiraLinhaVazia(horizonPatch, 'Aportes Sócios', 'A', 12, 61);
  ok(plvDepois === 25, 'primeiraLinhaVazia apos patch -> 25', String(plvDepois));

  const valHorizon = rodarPython(`
import datetime, openpyxl
wb = openpyxl.load_workbook(r'${horizonPatchPath}', data_only=False)
ap = wb['Aportes Sócios']
print('A24_is_date', isinstance(ap['A24'].value, datetime.datetime) and ap['A24'].value.date() == datetime.date(2026,7,24))
print('B24', repr(ap['B24'].value)); print('E24', ap['E24'].value)
print('F24_f', repr(ap['F24'].value))
dash = wb['Dashboard']
print('charts', len(dash._charts))
nf = sum(1 for row in dash.iter_rows() for c in row if isinstance(c.value, str) and c.value.startswith('='))
print('dash_formulas', nf)
`);
  ok(valHorizon.status === 0 && valHorizon.out.includes('A24_is_date True'), 'openpyxl: A24 e DATA 24/07/2026');
  ok(valHorizon.out.includes("B24 'André'") && valHorizon.out.includes('E24 5000'), 'openpyxl: B24/E24 corretos');
  ok(valHorizon.out.includes("F24_f '=IF(E24"), 'openpyxl: formula F24 intacta');
  ok(valHorizon.out.includes('charts 1'), 'openpyxl: grafico do Dashboard intacto (1 chart)');
  ok(valHorizon.out.includes('dash_formulas 46'), 'openpyxl: 46 formulas do Dashboard intactas');
  console.log('    (openpyxl) ' + valHorizon.out.replace(/\n/g, '\n    (openpyxl) '));

  // --- (e) patch controle-obras 'RJ Maricá' G14
  console.log('[e. patch controle-obras G14]');
  const obrasPatch = patchCelulas(bufObras, 'RJ Maricá', [
    { ref: 'G14', valor: 'Recebido', tipo: 'texto' },
  ]);
  const obrasPatchPath = path.join(DIR, 'controle-obras.patched.xlsx');
  fs.writeFileSync(obrasPatchPath, obrasPatch);
  const valObras = rodarPython(`
import warnings, openpyxl
def abrir(p):
    with warnings.catch_warnings(record=True) as avisos:
        warnings.simplefilter('always')
        wb = openpyxl.load_workbook(p, data_only=False)
    return wb, sorted(set(str(a.message) for a in avisos))
wb0, av0 = abrir(r'${path.join(DIR, 'controle-obras.store.xlsx')}')
wb1, av1 = abrir(r'${obrasPatchPath}')
print('G14', repr(wb1['RJ Maricá']['G14'].value))
print('charts', len(wb1['Resumo Geral']._charts))
print('warnings_iguais', av0 == av1)
print('warnings_novos', [w for w in av1 if w not in av0])
`);
  ok(valObras.status === 0 && valObras.out.includes("G14 'Recebido'"), "openpyxl: G14 = 'Recebido'");
  ok(valObras.out.includes('charts 2'), 'openpyxl: 2 graficos do Resumo Geral intactos');
  ok(valObras.out.includes('warnings_iguais True'), 'openpyxl: sem warnings novos', valObras.out.split('\n').find((l) => l.startsWith('warnings_novos')));
  console.log('    (openpyxl) ' + valObras.out.replace(/\n/g, '\n    (openpyxl) '));

  // --- (f) byte-fidelidade: somente a sheet alterada muda
  console.log('[f. byte-fidelidade]');
  for (const [rotulo, antes, depois, sheetAlterada] of [
    ['lojao', bufLojao, lojaoPatch, 'xl/worksheets/sheet3.xml'],
    ['horizon', bufHorizon, horizonPatch, 'xl/worksheets/sheet3.xml'],
    ['controle-obras', bufObras, obrasPatch, 'xl/worksheets/sheet4.xml'],
  ]) {
    const ea = lerEntradas(antes);
    const ed = lerEntradas(depois);
    const nomesIguais = JSON.stringify([...ea.keys()]) === JSON.stringify([...ed.keys()]);
    const mudadas = [];
    for (const [nome, a] of ea) {
      const d = ed.get(nome);
      if (!d || !a.buffer.equals(d.buffer)) mudadas.push(nome);
    }
    ok(nomesIguais && mudadas.length === 1 && mudadas[0] === sheetAlterada,
      `${rotulo}: so ${sheetAlterada} mudou`, `entradas alteradas: [${mudadas.join(', ')}]`);
  }

  // --- (g) celula com formula -> erro
  console.log('[g. protecao de formula]');
  try {
    patchCelulas(bufLojao, 'VENDAS', [{ ref: 'H31', valor: 1, tipo: 'numero' }]);
    ok(false, 'patch em H31 (formula) deveria falhar');
  } catch (e) {
    ok(e.message.includes('celula tem formula'), 'erro esperado em H31', e.message);
  }
  try {
    patchCelulas(bufHorizon, 'Aportes Sócios', [{ ref: 'F24', valor: 1, tipo: 'numero' }]);
    ok(false, 'patch em F24 (formula) deveria falhar');
  } catch (e) {
    ok(e.message.includes('celula tem formula'), 'erro esperado em F24', e.message);
  }
  // formula COMPARTILHADA cobrindo celula sem <f> propria (caso real do arquivo horizon,
  // aba Vendas: master J44 tem ref="J44:J75", mas J62 e '<c r="J62" s="10"/>' sem <f>;
  // F62 nem existe no XML e esta dentro de ref="F44:F75")
  try {
    patchCelulas(bufHorizon, 'Vendas', [{ ref: 'J62', valor: 1, tipo: 'numero' }]);
    ok(false, 'patch em J62 (range de formula compartilhada, sem <f> propria) deveria falhar');
  } catch (e) {
    ok(e.message.includes('compartilhada'), 'erro esperado em J62 (shared ref J44:J75)', e.message);
  }
  try {
    patchCelulas(bufHorizon, 'Vendas', [{ ref: 'F62', valor: 1, tipo: 'numero' }]);
    ok(false, 'patch em F62 (celula ausente dentro de shared ref) deveria falhar');
  } catch (e) {
    ok(e.message.includes('compartilhada'), 'erro esperado em F62 (shared ref F44:F75)', e.message);
  }
  // fora dos ranges compartilhados da mesma aba, escrita segue permitida
  const vendasHz = patchCelulas(bufHorizon, 'Vendas', [{ ref: 'B62', valor: 'Teste fora do shared', tipo: 'texto' }]);
  const relidoHz = lerCelulas(vendasHz, 'Vendas', ['B62']);
  ok(relidoHz.B62 && relidoHz.B62.valor === 'Teste fora do shared', 'B62 (fora dos shared refs) patchavel', JSON.stringify(relidoHz.B62));

  // --- (g2) texto com caractere de controle ilegal em XML -> erro (nao corrompe a sheet)
  try {
    patchCelulas(bufLojao, 'VENDAS', [{ ref: 'D31', valor: 'abc\u0007def', tipo: 'texto' }]);
    ok(false, 'texto com U+0007 deveria falhar');
  } catch (e) {
    ok(e.message.includes('U+0007'), 'erro esperado para caractere de controle', e.message);
  }

  // --- (g3) rows fora de ordem no XML (legal, raro): nao pode duplicar a row alvo
  console.log('[g3. rows fora de ordem]');
  {
    // gera uma copia do lojao com a row 30 movida para ANTES da row 20 na sheet3
    const mut = rodarPython(`
import zipfile, re, shutil
src = r'${path.join(DIR, 'lojao.store.xlsx')}'
dst = r'${path.join(DIR, 'lojao.desordenado.store.xlsx')}'
zin = zipfile.ZipFile(src)
xml = zin.read('xl/worksheets/sheet3.xml').decode('utf-8')
r30 = re.search(r'<row r="30".*?</row>', xml, re.S).group(0)
r20 = re.search(r'<row r="20".*?</row>', xml, re.S).group(0)
xml2 = xml.replace(r30, '').replace(r20, r30 + r20)
assert xml2 != xml and xml2.count('<row r="30"') == 1
with zipfile.ZipFile(dst, 'w', compression=zipfile.ZIP_STORED) as zout:
    for info in zin.infolist():
        data = zin.read(info.filename)
        if info.filename == 'xl/worksheets/sheet3.xml':
            data = xml2.encode('utf-8')
        novo = zipfile.ZipInfo(info.filename, date_time=info.date_time)
        novo.compress_type = zipfile.ZIP_STORED
        zout.writestr(novo, data)
print('ok')
`);
    ok(mut.status === 0 && mut.out === 'ok', 'gerou lojao.desordenado (row 30 antes da row 20)', mut.err.slice(0, 200));
    const bufDesord = carregar('lojao.desordenado.store.xlsx');
    // patch numa celula da row 20, que agora aparece DEPOIS da row 30 no XML
    const desordPatch = patchCelulas(bufDesord, 'VENDAS', [{ ref: 'C20', valor: 'PATCH-FORA-DE-ORDEM', tipo: 'texto' }]);
    const xmlDepois = lerEntradas(desordPatch).get('xl/worksheets/sheet3.xml').buffer.toString('utf8');
    const qtdRow20 = (xmlDepois.match(/<row r="20"/g) || []).length;
    ok(qtdRow20 === 1, 'row 20 NAO duplicada apos patch em XML fora de ordem', `ocorrencias de <row r="20">: ${qtdRow20}`);
    const relidoDesord = lerCelulas(desordPatch, 'VENDAS', ['C20', 'A20', 'G20']);
    ok(relidoDesord.C20 && relidoDesord.C20.valor === 'PATCH-FORA-DE-ORDEM', 'C20 patchada na row existente', JSON.stringify(relidoDesord.C20));
    ok(relidoDesord.A20 && relidoDesord.A20.valor === 9, 'A20 preservada na row fora de ordem', JSON.stringify(relidoDesord.A20));
    const desordPath = path.join(DIR, 'lojao.desordenado.patched.xlsx');
    fs.writeFileSync(desordPath, desordPatch);
    const valDesord = rodarPython(`
import openpyxl
wb = openpyxl.load_workbook(r'${path.join(DIR, 'lojao.desordenado.patched.xlsx')}', data_only=False)
v = wb['VENDAS']
print('C20', repr(v['C20'].value)); print('A20', v['A20'].value)
`);
    ok(valDesord.status === 0 && valDesord.out.includes("C20 'PATCH-FORA-DE-ORDEM'") && valDesord.out.includes('A20 9'),
      'openpyxl le o arquivo fora de ordem patchado', valDesord.out.replace(/\n/g, ' | '));
  }

  // --- (h) round-trip de leitura: reabrir patchados com openpyxl ja coberto acima; valida zip integro
  console.log('[h. round-trip]');
  const valZip = rodarPython(`
import zipfile
for p in [r'${lojaoPatchPath}', r'${horizonPatchPath}', r'${obrasPatchPath}']:
    z = zipfile.ZipFile(p)
    ruim = z.testzip()
    metodos = set(i.compress_type for i in z.infolist())
    print(p.split('/')[-1], 'crc_ok' if ruim is None else 'CRC RUIM: '+ruim, 'metodos', metodos)
`);
  ok(valZip.status === 0 && !valZip.out.includes('CRC RUIM') && !valZip.out.includes('8'), 'zips patchados: CRC ok e 100% STORE');
  console.log('    (zipfile) ' + valZip.out.replace(/\n/g, '\n    (zipfile) '));

  console.log(falhas === 0 ? '\nTODOS OS TESTES PASSARAM' : `\n${falhas} TESTE(S) FALHARAM`);
  process.exit(falhas === 0 ? 0 : 1);
}
