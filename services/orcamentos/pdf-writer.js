// pdf-writer.js — gerador de PDF de orcamentos a partir de template visual
//
// JavaScript puro, zero dependencias npm (projetado para colar dentro de um
// Code node do n8n, Node 18+). Nao usa Date.now()/Math.random(): a saida e
// 100% deterministica para as mesmas entradas (CreationDate omitido).
//
// Modelo: cada pagina do PDF e uma imagem JPEG full-bleed (o design fixo do
// modelo, ex: Ambiente Aquatico) com os textos variaveis desenhados por cima
// conforme o layout spec (services/orcamentos/templates/*.layout.json).
//
// API principal:
//   buildOrcamentoPdf(layout, imagensB64, campos) -> string base64 do PDF
//     layout     : objeto do layout spec ja parseado
//     imagensB64 : array de strings base64 (JPEG por pagina; layout.pages[i].img indexa)
//     campos     : objeto {cliente: "...", mes_ano: "...", ...}

'use strict';

// ---------------------------------------------------------------------------
// Tabelas de largura AFM (Adobe Font Metrics) das fontes base-14 usadas,
// em unidades de 1/1000 do tamanho da fonte, indexadas pelo codigo WinAnsi.
// Valores oficiais dos AFMs da Adobe (Helvetica, Helvetica-Bold, Times-Bold).
// Cada tabela cobre os codigos 32..255 (indice = codigo - 32); codigos sem
// glifo no WinAnsi (127, 129, 141, 143, 144, 157) valem 0.
// ---------------------------------------------------------------------------

var AFM_WIDTHS = {
  'Helvetica': [
    // 32..47
    278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
    // 48..63
    556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
    // 64..79
    1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
    // 80..95
    667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
    // 96..111
    333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
    // 112..127
    556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584, 0,
    // 128..143 (Euro, -, quotesinglbase, florin, quotedblbase, ellipsis, dagger, daggerdbl, circumflex, perthousand, Scaron, guilsinglleft, OE, -, Zcaron, -)
    556, 0, 222, 556, 333, 1000, 556, 556, 333, 1000, 667, 333, 1000, 0, 611, 0,
    // 144..159 (-, quoteleft, quoteright, quotedblleft, quotedblright, bullet, endash, emdash, tilde, trademark, scaron, guilsinglright, oe, -, zcaron, Ydieresis)
    0, 222, 222, 333, 333, 350, 556, 1000, 333, 1000, 500, 333, 944, 0, 500, 667,
    // 160..175
    278, 333, 556, 556, 556, 556, 260, 556, 333, 737, 370, 556, 584, 333, 737, 333,
    // 176..191
    400, 584, 333, 333, 333, 556, 537, 278, 333, 333, 365, 556, 834, 834, 834, 611,
    // 192..207 (Agrave..Idieresis)
    667, 667, 667, 667, 667, 667, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278,
    // 208..223 (Eth..germandbls)
    722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611,
    // 224..239 (agrave..idieresis)
    556, 556, 556, 556, 556, 556, 889, 500, 556, 556, 556, 556, 278, 278, 278, 278,
    // 240..255 (eth..ydieresis)
    556, 556, 556, 556, 556, 556, 556, 584, 611, 556, 556, 556, 556, 500, 556, 500
  ],
  'Helvetica-Bold': [
    278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
    556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
    975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
    667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
    333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
    611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584, 0,
    556, 0, 278, 556, 500, 1000, 556, 556, 333, 1000, 667, 333, 1000, 0, 611, 0,
    0, 278, 278, 500, 500, 350, 556, 1000, 333, 1000, 556, 333, 944, 0, 500, 667,
    278, 333, 556, 556, 556, 556, 280, 556, 333, 737, 370, 556, 584, 333, 737, 333,
    400, 584, 333, 333, 333, 611, 556, 278, 333, 333, 365, 556, 834, 834, 834, 611,
    722, 722, 722, 722, 722, 722, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278,
    722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611,
    556, 556, 556, 556, 556, 556, 889, 556, 556, 556, 556, 556, 278, 278, 278, 278,
    611, 611, 611, 611, 611, 611, 611, 584, 611, 611, 611, 611, 611, 556, 611, 556
  ],
  'Times-Bold': [
    250, 333, 555, 500, 500, 1000, 833, 278, 333, 333, 500, 570, 250, 333, 250, 278,
    500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 333, 333, 570, 570, 570, 500,
    930, 722, 667, 722, 722, 667, 611, 778, 778, 389, 500, 778, 667, 944, 722, 778,
    611, 778, 722, 556, 667, 722, 722, 1000, 722, 722, 667, 333, 278, 333, 581, 500,
    333, 500, 556, 444, 556, 444, 333, 500, 556, 278, 333, 556, 278, 833, 556, 500,
    556, 556, 444, 389, 333, 556, 500, 722, 500, 500, 444, 394, 220, 394, 520, 0,
    500, 0, 333, 500, 500, 1000, 500, 500, 333, 1000, 556, 333, 1000, 0, 667, 0,
    0, 333, 333, 500, 500, 350, 500, 1000, 333, 1000, 389, 333, 722, 0, 444, 722,
    250, 333, 500, 500, 500, 500, 220, 500, 333, 747, 300, 500, 570, 333, 747, 333,
    400, 570, 300, 300, 333, 556, 540, 250, 333, 300, 330, 500, 750, 750, 750, 500,
    722, 722, 722, 722, 722, 722, 1000, 722, 667, 667, 667, 667, 389, 389, 389, 389,
    722, 722, 778, 778, 778, 778, 778, 570, 778, 722, 722, 722, 722, 722, 611, 556,
    500, 500, 500, 500, 500, 500, 722, 444, 444, 444, 444, 444, 278, 278, 278, 278,
    500, 556, 500, 500, 500, 500, 500, 570, 500, 556, 556, 556, 556, 500, 556, 500
  ]
};

// Nome do recurso de fonte no PDF por base font
var FONT_RES = { 'Helvetica': 'F1', 'Helvetica-Bold': 'F2', 'Times-Bold': 'F3' };

// ---------------------------------------------------------------------------
// Encoding WinAnsi: converte string JS (unicode) para array de bytes WinAnsi.
// Cobre ASCII, Latin-1 (acentos do portugues) e os pontos especiais da faixa
// 0x80..0x9F do WinAnsi (aspas curvas, travessoes, bullet, reticencias etc).
// Caractere sem mapeamento: tenta um equivalente proximo, senao vira '?'.
// ---------------------------------------------------------------------------

// unicode -> codigo WinAnsi para os pontos que diferem do Latin-1
var WINANSI_MAP = {
  0x20AC: 128, // euro
  0x201A: 130, 0x0192: 131, 0x201E: 132,
  0x2026: 133, // reticencias
  0x2020: 134, 0x2021: 135, 0x02C6: 136, 0x2030: 137,
  0x0160: 138, 0x2039: 139, 0x0152: 140, 0x017D: 142,
  0x2018: 145, 0x2019: 146, // aspas simples curvas
  0x201C: 147, 0x201D: 148, // aspas duplas curvas
  0x2022: 149, // bullet
  0x2013: 150, // en-dash
  0x2014: 151, // em-dash
  0x02DC: 152, 0x2122: 153, 0x0161: 154, 0x203A: 155,
  0x0153: 156, 0x017E: 158, 0x0178: 159
};

// substituicoes por equivalente proximo quando o glifo nao existe no WinAnsi
var FALLBACK_MAP = {
  0x2212: 0x2D, // sinal de menos -> hifen
  0x00A0: 0x20, // nbsp -> espaco (nbsp existe no WinAnsi mas espaco simples e mais seguro)
  0x2015: 151,  // barra horizontal -> em-dash
  0x2043: 0x2D  // hyphen bullet -> hifen
};

function toWinAnsiBytes(str) {
  var out = [];
  for (var i = 0; i < str.length; i++) {
    var cp = str.charCodeAt(i);
    // whitespace de controle (\t \n \v \f \r, NEL, line/paragraph separator)
    // vira espaco em vez de '?' — campos colados de WhatsApp/planilha trazem \n
    if (cp === 0x09 || cp === 0x0A || cp === 0x0B || cp === 0x0C || cp === 0x0D ||
        cp === 0x85 || cp === 0x2028 || cp === 0x2029) { out.push(0x20); continue; }
    if (cp >= 32 && cp <= 126) { out.push(cp); continue; }        // ASCII
    if (cp >= 0xA0 && cp <= 0xFF) { out.push(cp); continue; }     // Latin-1 (acentos)
    if (WINANSI_MAP[cp] !== undefined) { out.push(WINANSI_MAP[cp]); continue; }
    if (FALLBACK_MAP[cp] !== undefined) { out.push(FALLBACK_MAP[cp]); continue; }
    // par surrogate (emoji etc): consome os DOIS code units e emite UM '?'
    if (cp >= 0xD800 && cp <= 0xDBFF && i + 1 < str.length) {
      var lo = str.charCodeAt(i + 1);
      if (lo >= 0xDC00 && lo <= 0xDFFF) i++;
    }
    out.push(0x3F); // '?'
  }
  return out;
}

// escapa bytes de string PDF: ( ) \ — retorna string latin1 pronta pro stream
function pdfEscapeBytes(bytes) {
  var s = '';
  for (var i = 0; i < bytes.length; i++) {
    var b = bytes[i];
    if (b === 0x28 || b === 0x29 || b === 0x5C) s += '\\';
    s += String.fromCharCode(b);
  }
  return s;
}

// ---------------------------------------------------------------------------
// Medida de texto: soma das larguras AFM, ja em pontos para o size dado
// ---------------------------------------------------------------------------

function textWidth(str, baseFont, size) {
  var widths = AFM_WIDTHS[baseFont];
  if (!widths) throw new Error('fonte sem tabela AFM: ' + baseFont);
  var bytes = toWinAnsiBytes(str);
  var total = 0;
  for (var i = 0; i < bytes.length; i++) {
    var w = widths[bytes[i] - 32] || 0;
    total += w;
  }
  return total * size / 1000;
}

// ---------------------------------------------------------------------------
// Cores e numeros
// ---------------------------------------------------------------------------

function hexToRgb(hex) {
  var h = (hex || '#000000').replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255
  ];
}

// numero com ate 3 casas, sem zeros sobrando (saida deterministica)
function num(v) {
  return String(Math.round(v * 1000) / 1000);
}

function rgOp(hex) {
  var c = hexToRgb(hex);
  return num(c[0]) + ' ' + num(c[1]) + ' ' + num(c[2]) + ' rg';
}

// ---------------------------------------------------------------------------
// Parser de JPEG: extrai width/height/componentes lendo os marcadores SOF
// ---------------------------------------------------------------------------

function jpegInfo(buf) {
  if (buf.length < 4 || buf[0] !== 0xFF || buf[1] !== 0xD8) {
    throw new Error('imagem nao e JPEG (sem SOI)');
  }
  var i = 2;
  while (i + 3 < buf.length) {
    if (buf[i] !== 0xFF) { i++; continue; }
    var marker = buf[i + 1];
    // marcadores sem payload
    if (marker === 0xFF) { i++; continue; }
    if (marker === 0x01 || (marker >= 0xD0 && marker <= 0xD8)) { i += 2; continue; }
    var len = (buf[i + 2] << 8) | buf[i + 3];
    // SOF0..SOF15 exceto DHT(C4), JPG(C8), DAC(CC)
    if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
      return {
        height: (buf[i + 5] << 8) | buf[i + 6],
        width: (buf[i + 7] << 8) | buf[i + 8],
        components: buf[i + 9]
      };
    }
    if (marker === 0xDA) break; // SOS: dados comprimidos, SOF ja deveria ter aparecido
    i += 2 + len;
  }
  throw new Error('JPEG sem marcador SOF');
}

// ---------------------------------------------------------------------------
// Helpers de campos
// ---------------------------------------------------------------------------

function isEmpty(v) {
  return v === undefined || v === null || String(v).trim() === '';
}

function fieldValue(campos, key) {
  var v = campos[key];
  return isEmpty(v) ? '' : String(v).trim();
}

// elemento com "if": so renderiza se o campo referenciado estiver preenchido
function passesIf(el, campos) {
  if (!el['if']) return true;
  return !isEmpty(campos[el['if']]);
}

// ---------------------------------------------------------------------------
// Renderizadores de elementos -> operadores de content stream
// Coordenadas do layout sao TOP-based (origem no topo); PDF e BOTTOM-based:
//   yPDF = pageH - yLayout
// ---------------------------------------------------------------------------

var ELLIPSIS = '…';
var SHRINK_MIN = 0.6; // fator minimo de encolhimento (60% do size original)

// operador de um trecho de texto numa posicao absoluta
function textOp(str, baseFont, size, colorHex, x, yPdf) {
  var bytes = toWinAnsiBytes(str);
  return 'BT /' + FONT_RES[baseFont] + ' ' + num(size) + ' Tf ' + rgOp(colorHex) +
    ' ' + num(x) + ' ' + num(yPdf) + ' Td (' + pdfEscapeBytes(bytes) + ') Tj ET\n';
}

// encolhe size ate o texto caber em maxWidth (limite SHRINK_MIN); se mesmo no
// minimo nao couber, corta com reticencias. Retorna {str, size}.
function fitText(str, baseFont, size, maxWidth) {
  var w = textWidth(str, baseFont, size);
  if (w <= maxWidth) return { str: str, size: size };
  var newSize = size * maxWidth / w;
  if (newSize >= size * SHRINK_MIN) return { str: str, size: newSize };
  // nem no minimo coube: trunca com "…" no size minimo
  newSize = size * SHRINK_MIN;
  var s = str;
  while (s.length > 0 && textWidth(s + ELLIPSIS, baseFont, newSize) > maxWidth) {
    s = s.substring(0, s.length - 1).replace(/\s+$/, '');
  }
  return { str: s + ELLIPSIS, size: newSize };
}

// quebra por palavras em maxWidth; palavra maior que a linha e quebrada por
// caracteres para nunca estourar a caixa
function wrapWords(str, baseFont, size, maxWidth) {
  var words = str.split(/\s+/).filter(function (w) { return w.length > 0; });
  var lines = [];
  var cur = '';
  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    var cand = cur === '' ? word : cur + ' ' + word;
    if (textWidth(cand, baseFont, size) <= maxWidth) {
      cur = cand;
      continue;
    }
    if (cur !== '') { lines.push(cur); cur = ''; }
    // palavra sozinha ainda maior que a linha: quebra por caracteres
    while (textWidth(word, baseFont, size) > maxWidth && word.length > 1) {
      var cut = word.length - 1;
      while (cut > 1 && textWidth(word.substring(0, cut), baseFont, size) > maxWidth) cut--;
      lines.push(word.substring(0, cut));
      word = word.substring(cut);
    }
    cur = word;
  }
  if (cur !== '') lines.push(cur);
  return lines;
}

function renderRect(el, campos, pageH) {
  // rect ifEmpty: cobre a area quando o campo esta vazio (esconde card do modelo)
  if (el.ifEmpty && !isEmpty(campos[el.ifEmpty])) return '';
  var yPdf = pageH - el.y - el.h; // canto inferior esquerdo no sistema do PDF
  return rgOp(el.color) + ' ' + num(el.x) + ' ' + num(yPdf) + ' ' +
    num(el.w) + ' ' + num(el.h) + ' re f\n';
}

function renderText(el, campos, layout) {
  if (!passesIf(el, campos)) return '';
  var str = fieldValue(campos, el.key);
  if (str === '') return '';
  var baseFont = layout.fonts[el.font];
  var fit = el.shrink && el.maxWidth
    ? fitText(str, baseFont, el.size, el.maxWidth)
    : { str: str, size: el.size };
  var x = el.x;
  if (el.align === 'right') x = el.x - textWidth(fit.str, baseFont, fit.size);
  return textOp(fit.str, baseFont, fit.size, el.color, x, layout.pageH - el.baseline);
}

function renderWrap(el, campos, layout) {
  if (!passesIf(el, campos)) return '';
  var str = fieldValue(campos, el.key);
  if (str === '') return '';
  var baseFont = layout.fonts[el.font];
  var size = el.size;
  var lines = wrapWords(str, baseFont, size, el.maxWidth);
  if (el.maxLines && lines.length > el.maxLines) {
    // uma tentativa com fonte 8% menor
    var smaller = el.size * 0.92;
    var retry = wrapWords(str, baseFont, smaller, el.maxWidth);
    if (retry.length <= el.maxLines) {
      size = smaller;
      lines = retry;
    } else {
      // ainda nao coube: trunca a ultima linha visivel com "…"
      lines = lines.slice(0, el.maxLines);
      var last = lines[el.maxLines - 1];
      while (last.length > 0 && textWidth(last + ELLIPSIS, baseFont, size) > el.maxWidth) {
        last = last.substring(0, last.length - 1).replace(/\s+$/, '');
      }
      lines[el.maxLines - 1] = last + ELLIPSIS;
    }
  }
  var ops = '';
  for (var i = 0; i < lines.length; i++) {
    var yPdf = layout.pageH - (el.baseline + i * el.lineHeight);
    ops += textOp(lines[i], baseFont, size, el.color, el.x, yPdf);
  }
  return ops;
}

function renderLine(el, campos, layout) {
  if (!passesIf(el, campos)) return '';
  // resolve os segments: key -> valor do campo (vazio se ausente), text -> literal
  var segs = [];
  var total = 0;
  for (var i = 0; i < el.segments.length; i++) {
    var s = el.segments[i];
    var str = s.key !== undefined ? fieldValue(campos, s.key) : String(s.text);
    var baseFont = layout.fonts[s.font];
    segs.push({ str: str, baseFont: baseFont, size: s.size, color: s.color, isKey: s.key !== undefined });
    total += textWidth(str, baseFont, s.size);
  }
  if (total === 0) return '';
  // shrink: fator unico aplicado a todos os segments
  var factor = 1;
  if (el.shrink && el.maxWidth && total > el.maxWidth) {
    factor = Math.max(el.maxWidth / total, SHRINK_MIN);
  }
  // se mesmo no fator minimo nao coube, encurta com "…" o MAIOR segment de
  // campo (tipicamente o nome do cliente) ate a linha inteira caber — os
  // demais segments sobrevivem (um nome gigante nao pode engolir o mes/ano).
  // tolerancia de 0.01pt: total*(maxWidth/total) pode passar de maxWidth por
  // erro de ponto flutuante e truncaria com "…" um texto que cabe exato.
  if (el.maxWidth && total * factor > el.maxWidth + 0.01) {
    var widest = -1, widestW = -1;
    for (var j = 0; j < segs.length; j++) {
      var w = textWidth(segs[j].str, segs[j].baseFont, segs[j].size * factor);
      if (segs[j].isKey && w > widestW) { widest = j; widestW = w; }
    }
    if (widest < 0) widest = 0;
    var fixedW = 0;
    for (var j2 = 0; j2 < segs.length; j2++) {
      if (j2 !== widest) fixedW += textWidth(segs[j2].str, segs[j2].baseFont, segs[j2].size * factor);
    }
    var avail = el.maxWidth - fixedW;
    var cutStr = segs[widest].str;
    while (cutStr.length > 0 &&
           textWidth(cutStr + ELLIPSIS, segs[widest].baseFont, segs[widest].size * factor) > avail) {
      cutStr = cutStr.substring(0, cutStr.length - 1).replace(/\s+$/, '');
    }
    segs[widest].str = cutStr + ELLIPSIS;
  }
  // desenha os segments em sequencia na mesma baseline (Tj avanca a posicao)
  var yPdf = layout.pageH - el.baseline;
  var ops = 'BT ' + num(el.x) + ' ' + num(yPdf) + ' Td\n';
  for (var k = 0; k < segs.length; k++) {
    var g = segs[k];
    if (g.str === '') continue;
    ops += '/' + FONT_RES[g.baseFont] + ' ' + num(g.size * factor) + ' Tf ' +
      rgOp(g.color) + ' (' + pdfEscapeBytes(toWinAnsiBytes(g.str)) + ') Tj\n';
  }
  ops += 'ET\n';
  return ops;
}

// ---------------------------------------------------------------------------
// Montagem do PDF (1.4, sem compressao, xref classico)
// ---------------------------------------------------------------------------

function buildOrcamentoPdf(layout, imagensB64, campos) {
  var pageW = layout.pageW;
  var pageH = layout.pageH;

  // decodifica as imagens uma vez e dedupe por indice
  var imgBuffers = imagensB64.map(function (b64) { return Buffer.from(b64, 'base64'); });

  // objetos do PDF: array de strings latin1 / Buffers, indice = numero - 1
  var objects = [];
  function addObj(body) {
    objects.push(body);
    return objects.length; // numero do objeto
  }

  // 1: Catalog (Pages sera o objeto 2)
  addObj('<< /Type /Catalog /Pages 2 0 R >>');
  // 2: Pages (kids preenchidos depois)
  var pagesObjIdx = addObj('') - 1;

  // 3..5: fontes base-14 com WinAnsiEncoding
  var fontObjNum = {};
  ['Helvetica', 'Helvetica-Bold', 'Times-Bold'].forEach(function (bf) {
    fontObjNum[bf] = addObj(
      '<< /Type /Font /Subtype /Type1 /BaseFont /' + bf +
      ' /Encoding /WinAnsiEncoding >>'
    );
  });
  var fontResEntries = Object.keys(FONT_RES).map(function (bf) {
    return '/' + FONT_RES[bf] + ' ' + fontObjNum[bf] + ' 0 R';
  }).join(' ');

  // XObjects de imagem: um por indice usado, embutindo o JPEG direto (DCTDecode)
  var imgObjNum = {};
  layout.pages.forEach(function (pg) {
    if (imgObjNum[pg.img] !== undefined) return;
    var buf = imgBuffers[pg.img];
    if (!buf) throw new Error('imagem ausente no indice ' + pg.img);
    var info = jpegInfo(buf);
    var cs = info.components === 1 ? '/DeviceGray'
      : info.components === 4 ? '/DeviceCMYK' : '/DeviceRGB';
    var dict = '<< /Type /XObject /Subtype /Image /Width ' + info.width +
      ' /Height ' + info.height + ' /ColorSpace ' + cs +
      ' /BitsPerComponent 8 /Filter /DCTDecode /Length ' + buf.length + ' >>';
    imgObjNum[pg.img] = addObj({ dict: dict, stream: buf });
  });

  // paginas: content stream + objeto de pagina
  var pageObjNums = [];
  layout.pages.forEach(function (pg, pi) {
    var imgName = 'Im' + pg.img;
    // imagem full-bleed cobrindo a MediaBox inteira
    var content = 'q ' + num(pageW) + ' 0 0 ' + num(pageH) + ' 0 0 cm /' + imgName + ' Do Q\n';

    var elements = pg.elements || [];
    // ordem exigida: rects primeiro (cobrem areas), depois textos
    elements.filter(function (e) { return e.type === 'rect'; }).forEach(function (el) {
      content += renderRect(el, campos, pageH);
    });
    elements.filter(function (e) { return e.type !== 'rect'; }).forEach(function (el) {
      if (el.type === 'text') content += renderText(el, campos, layout);
      else if (el.type === 'wrap') content += renderWrap(el, campos, layout);
      else if (el.type === 'line') content += renderLine(el, campos, layout);
      else throw new Error('tipo de elemento desconhecido: ' + el.type);
    });

    var contentBuf = Buffer.from(content, 'latin1');
    var contentNum = addObj({
      dict: '<< /Length ' + contentBuf.length + ' >>',
      stream: contentBuf
    });

    var pageNum = addObj(
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + num(pageW) + ' ' + num(pageH) + ']' +
      ' /Resources << /Font << ' + fontResEntries + ' >>' +
      ' /XObject << /' + imgName + ' ' + imgObjNum[pg.img] + ' 0 R >> >>' +
      ' /Contents ' + contentNum + ' 0 R >>'
    );
    pageObjNums.push(pageNum);
  });

  // completa o objeto Pages
  objects[pagesObjIdx] = '<< /Type /Pages /Count ' + pageObjNums.length +
    ' /Kids [' + pageObjNums.map(function (n) { return n + ' 0 R'; }).join(' ') + '] >>';

  // serializacao: header, corpo, xref, trailer (sem CreationDate/ID: deterministico)
  var chunks = [];
  var offset = 0;
  function push(bufOrStr) {
    var b = Buffer.isBuffer(bufOrStr) ? bufOrStr : Buffer.from(bufOrStr, 'latin1');
    chunks.push(b);
    offset += b.length;
  }

  push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'); // linha binaria padrao apos o header

  var xref = [0]; // offset por numero de objeto (indice 0 = obj livre)
  for (var i = 0; i < objects.length; i++) {
    xref.push(offset);
    var body = objects[i];
    push((i + 1) + ' 0 obj\n');
    if (typeof body === 'string') {
      push(body + '\nendobj\n');
    } else {
      push(body.dict + '\nstream\n');
      push(body.stream);
      push('\nendstream\nendobj\n');
    }
  }

  var xrefOffset = offset;
  var count = objects.length + 1;
  push('xref\n0 ' + count + '\n');
  push('0000000000 65535 f \n');
  for (var j = 1; j < count; j++) {
    push(('0000000000' + xref[j]).slice(-10) + ' 00000 n \n');
  }
  push('trailer\n<< /Size ' + count + ' /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF\n');

  return Buffer.concat(chunks).toString('base64');
}

// ---------------------------------------------------------------------------
// Export (guarda para poder colar o arquivo inteiro num Code node do n8n)
// ---------------------------------------------------------------------------

if (typeof module !== 'undefined') {
  module.exports = { buildOrcamentoPdf: buildOrcamentoPdf };
}

// ---------------------------------------------------------------------------
// Test harness: roda apenas quando executado direto (node pdf-writer.js)
// ---------------------------------------------------------------------------

if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  var fs = require('fs');
  var path = require('path');

  var TPL_DIR = path.join(__dirname, 'templates');
  var OUT_DIR = '/tmp/claude-0/-home-user-thiagoteste/46e0e517-f29e-5e6f-b738-f2e0a8076033/scratchpad/orc/out';

  var layout = JSON.parse(fs.readFileSync(path.join(TPL_DIR, 'ambiente-aquatico.layout.json'), 'utf8'));
  var imagens = [];
  for (var p = 1; p <= 11; p++) {
    var name = 'page' + String(p).padStart(2, '0') + '.jpg';
    imagens.push(fs.readFileSync(path.join(TPL_DIR, 'ambiente-aquatico', name)).toString('base64'));
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // (a) campos completos, 3 opcoes
  var campos3 = {
    cliente: 'Família Almeida',
    mes_ano: 'Julho/2026',
    numero: 'ORC-2026-001',
    validade: '27/07/2026',
    projeto_titulo: 'Lago Ornamental com Praia de Areia',
    projeto_descricao: 'Lago ornamental com praia de areia natural e cascata integrada ao paisagismo. Filtragem biológica dimensionada para água cristalina o ano todo.',
    volume: '18.000 a 22.000 litros',
    estilo: 'Orgânico · Praia de areia · Tropical',
    execucao: 'Projeto completo — chave na mão',
    investimento: 'R$ 48.000',
    opcao1_titulo: 'Lago Ornamental com Praia de Areia',
    opcao1_sub: 'Praia de areia · Cascata · Paisagismo das bordas',
    opcao1_valor: 'R$ 48.000',
    opcao2_titulo: 'Lago + Deck de Madeira e Iluminação',
    opcao2_sub: 'Tudo da opção 1 + deck · iluminação subaquática',
    opcao2_valor: 'R$ 86.000',
    opcao3_titulo: 'Complexo Completo com Piscina Natural',
    opcao3_sub: 'Lago + piscina natural · casa de máquinas dedicada',
    opcao3_valor: 'R$ 145.000'
  };

  // (b) so a opcao 1 (cards 2/3 devem sumir cobertos pelos rects)
  var campos1 = {
    cliente: 'Dona Ana Beatriz',
    mes_ano: 'Julho/2026',
    numero: 'ORC-2026-002',
    validade: '27/07/2026',
    projeto_titulo: 'Espelho d’Água com Carpas',
    projeto_descricao: 'Espelho d’água compacto com carpas ornamentais e filtragem discreta. Ideal para áreas de entrada e jardins de inverno.',
    volume: '6.000 a 8.000 litros',
    estilo: 'Minimalista · Carpas · Zen',
    execucao: 'Projeto completo — chave na mão',
    investimento: 'R$ 27.500',
    opcao1_titulo: 'Espelho d’Água com Carpas',
    opcao1_sub: 'Carpas · Filtragem discreta · Iluminação',
    opcao1_valor: 'R$ 27.500'
  };

  // (c) textos longos para exercitar o shrink em todos os pontos
  var camposShrink = {
    cliente: 'Condomínio Residencial Jardins de Alphaville Setor Leste',
    mes_ano: 'Julho/2026',
    numero: 'ORC-2026-003',
    validade: '27/07/2026',
    projeto_titulo: 'Complexo de Lagos Ornamentais Integrados com Praia de Areia Natural e Cascatas',
    projeto_descricao: 'Complexo de lagos interligados com praias de areia natural, cascatas em pedra e paisagismo tropical completo. Sistema de filtragem biológica de grande porte com casa de máquinas dedicada e automação.',
    volume: '180.000 a 220.000 litros distribuídos em três lagos interligados',
    estilo: 'Orgânico · Praia de areia · Cascatas · Tropical · Iluminado',
    execucao: 'Projeto completo — chave na mão com automação integrada',
    investimento: 'R$ 1.450.000',
    opcao1_titulo: 'Complexo de Lagos Ornamentais Integrados com Praia de Areia Natural e Cascatas',
    opcao1_sub: 'Três lagos · Praias de areia · Cascatas em pedra · Paisagismo tropical completo',
    opcao1_valor: 'R$ 1.450.000',
    opcao2_titulo: 'Complexo completo + Piscina Natural de Uso Recreativo Integrada',
    opcao2_sub: 'Tudo da opção 1 + piscina natural · deck · iluminação cênica',
    opcao2_valor: 'R$ 1.980.000',
    opcao3_titulo: 'Master plan completo com fase 2 de expansão e manutenção anual',
    opcao3_sub: 'Opção 2 + expansão futura · contrato de manutenção · monitoramento remoto',
    opcao3_valor: 'R$ 2.450.000'
  };

  var casos = [
    ['teste-3opcoes.pdf', campos3],
    ['teste-1opcao.pdf', campos1],
    ['teste-shrink.pdf', camposShrink]
  ];

  casos.forEach(function (caso) {
    var b64 = buildOrcamentoPdf(layout, imagens, caso[1]);
    var out = path.join(OUT_DIR, caso[0]);
    fs.writeFileSync(out, Buffer.from(b64, 'base64'));
    console.log('gerado: ' + out + ' (' + Buffer.from(b64, 'base64').length + ' bytes)');
  });
}
