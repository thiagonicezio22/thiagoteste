// Gera XLSX premium (puro JS, sem libs) - relatorio de gastos
// Identidade: dark premium (#0B1A13 verde, #C9A84C dourado, #F5F0E8 creme)
// Duas abas: Resumo (capa + KPIs + categorias) e Lancamentos (tabela com filtro e cabecalho congelado)
'use strict';

// ---------- ZIP (STORE, sem compressao) ----------
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
function zipStore(entries) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const e of entries) {
    const nameB = Buffer.from(e.name, 'utf8');
    const crc = crc32(e.data);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6);
    lh.writeUInt16LE(0, 8); lh.writeUInt16LE(0, 10); lh.writeUInt16LE(0x21, 12);
    lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(e.data.length, 18); lh.writeUInt32LE(e.data.length, 22);
    lh.writeUInt16LE(nameB.length, 26); lh.writeUInt16LE(0, 28);
    locals.push(lh, nameB, e.data);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(0, 10); ch.writeUInt16LE(0, 12); ch.writeUInt16LE(0x21, 14);
    ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(e.data.length, 20); ch.writeUInt32LE(e.data.length, 24);
    ch.writeUInt16LE(nameB.length, 28);
    ch.writeUInt32LE(offset, 42);
    centrals.push(ch, nameB);
    offset += 30 + nameB.length + e.data.length;
  }
  const cdSize = centrals.reduce((s, b) => s + b.length, 0);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8); eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cdSize, 12); eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, ...centrals, eocd]);
}

// ---------- helpers ----------
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function colLetter(n) {
  let s = '';
  while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

// ---------- estilos (indices de cellXfs) ----------
//  0 normal
//  1 titulo capa (Georgia 16 creme sobre verde, centro)
//  2 subtitulo capa (dourado sobre verde, centro)
//  3 secao (Georgia 12 verde sobre creme, acento dourado a esquerda)
//  4 header tabela (creme bold sobre verde, centro, sublinhado dourado)
//  5 kpi rotulo (oliva)
//  6 kpi moeda grande (bold 14 verde)
//  7 kpi numero grande (bold 14 verde)
//  8 texto | 9 texto zebra
// 10 moeda | 11 moeda zebra
// 12 pct   | 13 pct zebra
// 14 total rotulo (bold, borda dupla verde) | 15 total moeda
// 16 data centro | 17 data centro zebra
// 18 nota rodape (italico oliva)
// 19 kpi texto (normal, p/ maior gasto)
function stylesXml(moedaFmt) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="2">
<numFmt numFmtId="164" formatCode="&quot;${moedaFmt}&quot;\\ #,##0.00"/>
<numFmt numFmtId="165" formatCode="0%"/>
</numFmts>
<fonts count="9">
<font><sz val="11"/><color rgb="FF1F2418"/><name val="Calibri"/></font>
<font><b/><sz val="16"/><color rgb="FFF5F0E8"/><name val="Georgia"/></font>
<font><sz val="10"/><color rgb="FFC9A84C"/><name val="Calibri"/></font>
<font><b/><sz val="12"/><color rgb="FF0B1A13"/><name val="Georgia"/></font>
<font><b/><sz val="11"/><color rgb="FFF5F0E8"/><name val="Calibri"/></font>
<font><sz val="11"/><color rgb="FF6B7263"/><name val="Calibri"/></font>
<font><b/><sz val="14"/><color rgb="FF0B1A13"/><name val="Calibri"/></font>
<font><b/><sz val="11"/><color rgb="FF1F2418"/><name val="Calibri"/></font>
<font><i/><sz val="9"/><color rgb="FF6B7263"/><name val="Calibri"/></font>
</fonts>
<fills count="5">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF0B1A13"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFF5F0E8"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFF8F6F1"/></patternFill></fill>
</fills>
<borders count="5">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border><left/><right/><top/><bottom style="thin"><color rgb="FFE3DFD3"/></bottom><diagonal/></border>
<border><left/><right/><top style="double"><color rgb="FF0B1A13"/></top><bottom/><diagonal/></border>
<border><left style="medium"><color rgb="FFC9A84C"/></left><right/><top/><bottom/><diagonal/></border>
<border><left/><right/><top/><bottom style="medium"><color rgb="FFC9A84C"/></bottom><diagonal/></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="20">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="2" fillId="2" borderId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="3" fillId="3" borderId="3" applyAlignment="1"><alignment vertical="center" indent="1"/></xf>
<xf numFmtId="0" fontId="4" fillId="2" borderId="4" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="5" fillId="0" borderId="0" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="164" fontId="6" fillId="0" borderId="0" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
<xf numFmtId="0" fontId="6" fillId="0" borderId="0" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="4" borderId="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="164" fontId="0" fillId="0" borderId="1" applyAlignment="1"><alignment vertical="top"/></xf>
<xf numFmtId="164" fontId="0" fillId="4" borderId="1" applyAlignment="1"><alignment vertical="top"/></xf>
<xf numFmtId="165" fontId="5" fillId="0" borderId="1" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf>
<xf numFmtId="165" fontId="5" fillId="4" borderId="1" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf>
<xf numFmtId="0" fontId="7" fillId="0" borderId="2" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="164" fontId="7" fillId="0" borderId="2" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf>
<xf numFmtId="0" fontId="0" fillId="4" borderId="1" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf>
<xf numFmtId="0" fontId="8" fillId="0" borderId="0" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
}

// ---------- monta XML de uma folha ----------
function sheetXml(rows, merges, cols, opts) {
  const rowsXml = rows.map(row => {
    const cellsXml = (row.cells || []).map(c => {
      const ref = colLetter(c.col) + row.r;
      if (c.v != null) return `<c r="${ref}" s="${c.s}"><v>${c.v}</v></c>`;
      return `<c r="${ref}" s="${c.s}" t="inlineStr"><is><t xml:space="preserve">${esc(c.t)}</t></is></c>`;
    }).join('');
    const htAttr = row.ht ? ` ht="${row.ht}" customHeight="1"` : '';
    return `<row r="${row.r}"${htAttr}>${cellsXml}</row>`;
  }).join('');
  const colsXml = cols.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('');
  const freeze = opts && opts.freezeRow
    ? `<sheetViews><sheetView workbookViewId="0" showGridLines="0"><pane ySplit="${opts.freezeRow}" topLeftCell="A${opts.freezeRow + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`
    : `<sheetViews><sheetView workbookViewId="0" showGridLines="0"/></sheetViews>`;
  const filter = opts && opts.autoFilter ? `<autoFilter ref="${opts.autoFilter}"/>` : '';
  const mergesXml = merges.length ? `<mergeCells count="${merges.length}">${merges.map(m => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>` : '';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
${freeze}
<cols>${colsXml}</cols>
<sheetData>${rowsXml}</sheetData>
${filter}
${mergesXml}
<pageSetup orientation="landscape" fitToWidth="1"/>
</worksheet>`;
}

// helper de construcao de linhas
function mkSheet() {
  const rows = [], merges = [];
  let R = 0;
  return {
    rows, merges,
    add(cells, ht) { R++; rows.push({ r: R, cells, ht }); return R; },
    merge(r, c1, c2) { merges.push(`${colLetter(c1)}${r}:${colLetter(c2)}${r}`); },
    row() { return R; }
  };
}
function txt(col, s, style) { return { col, t: s, s: style }; }
function num(col, v, style) { return { col, v, s: style }; }
function band(sh, texto, sub, nCols) {
  let r = sh.add([txt(1, texto, 1), ...Array.from({ length: nCols - 1 }, (_, i) => txt(i + 2, '', 1))], 32);
  sh.merge(r, 1, nCols);
  r = sh.add([txt(1, sub, 2), ...Array.from({ length: nCols - 1 }, (_, i) => txt(i + 2, '', 2))], 17);
  sh.merge(r, 1, nCols);
}
function section(sh, texto, nCols) {
  const r = sh.add([txt(1, texto, 3), ...Array.from({ length: nCols - 1 }, (_, i) => txt(i + 2, '', 3))], 20);
  sh.merge(r, 1, nCols);
}

// ---------- relatorio ----------
function buildXlsx(meta) {
  const moedaFmt = meta.moeda === 'USD' ? '$' : 'R$';
  const fmtBR = v => moedaFmt + ' ' + (Number(v) || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const gastos = meta.gastos || [];
  const total = gastos.reduce((s, g) => s + (Number(g.valor) || 0), 0);
  const media = gastos.length ? total / gastos.length : 0;
  const porCat = {};
  for (const g of gastos) porCat[g.categoria] = (porCat[g.categoria] || 0) + (Number(g.valor) || 0);
  const cats = Object.entries(porCat).sort((a, b) => b[1] - a[1]);
  const maior = gastos.reduce((m, g) => (Number(g.valor) || 0) > (Number(m.valor) || 0) ? g : m, gastos[0] || {});
  const subtitulo = `${meta.nome || ''}  ·  ${meta.label_periodo || ''}  ·  gerado em ${meta.data_geracao || ''}`;

  // ===== Aba 1: Resumo =====
  const s1 = mkSheet();
  band(s1, 'Relatório de Gastos', subtitulo, 4);
  s1.add([]);
  section(s1, 'Resumo do período', 4);
  s1.add([txt(1, 'Total do período', 5), num(2, Math.round(total * 100) / 100, 6)], 20);
  s1.add([txt(1, 'Lançamentos', 5), num(2, gastos.length, 7)], 18);
  s1.add([txt(1, 'Média por lançamento', 5), num(2, Math.round(media * 100) / 100, 6)], 18);
  let r = s1.add([txt(1, 'Maior gasto', 5), txt(2, `${maior.descricao || '-'} (${fmtBR(maior.valor)})`, 19)], 18);
  s1.merge(r, 2, 4);
  s1.add([]);
  section(s1, 'Por categoria', 4);
  s1.add([txt(1, 'Categoria', 4), txt(2, 'Valor', 4), txt(3, '% do total', 4)]);
  cats.forEach(([c, v], i) => {
    const z = i % 2 === 1;
    s1.add([txt(1, c, z ? 9 : 8), num(2, Math.round(v * 100) / 100, z ? 11 : 10), num(3, total ? v / total : 0, z ? 13 : 12)]);
  });
  s1.add([txt(1, 'Total', 14), num(2, Math.round(total * 100) / 100, 15), txt(3, '', 14)]);
  s1.add([]);
  s1.add([txt(1, `Valores em ${meta.moeda === 'USD' ? 'dólares americanos (USD)' : 'reais (BRL)'}. Detalhes na aba Lançamentos.`, 18)]);

  // ===== Aba 2: Lancamentos =====
  const s2 = mkSheet();
  band(s2, 'Lançamentos detalhados', subtitulo, 6);
  s2.add([txt(1, 'Data', 4), txt(2, 'Descrição', 4), txt(3, 'Categoria', 4), txt(4, 'Forma de pagamento', 4), txt(5, 'Valor', 4), txt(6, 'Observações', 4)]);
  gastos.forEach((g, i) => {
    const z = i % 2 === 1;
    s2.add([
      txt(1, g.data || '', z ? 17 : 16),
      txt(2, g.descricao || '', z ? 9 : 8),
      txt(3, g.categoria || '', z ? 9 : 8),
      txt(4, g.forma || '', z ? 9 : 8),
      num(5, Math.round((Number(g.valor) || 0) * 100) / 100, z ? 11 : 10),
      txt(6, g.obs || '', z ? 9 : 8)
    ]);
  });
  const lastData = s2.row();
  s2.add([txt(1, '', 14), txt(2, 'Total', 14), txt(3, '', 14), txt(4, '', 14), num(5, Math.round(total * 100) / 100, 15), txt(6, '', 14)]);

  const sheet1 = sheetXml(s1.rows, s1.merges, [22, 20, 12, 34], {});
  const sheet2 = sheetXml(s2.rows, s2.merges, [12, 42, 15, 19, 14, 46], { freezeRow: 3, autoFilter: `A3:F${lastData}` });

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
  const wbRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="Resumo" sheetId="1" r:id="rId1"/><sheet name="Lançamentos" sheetId="2" r:id="rId2"/></sheets>
</workbook>`;

  const zip = zipStore([
    { name: '[Content_Types].xml', data: Buffer.from(contentTypes, 'utf8') },
    { name: '_rels/.rels', data: Buffer.from(rels, 'utf8') },
    { name: 'xl/workbook.xml', data: Buffer.from(workbook, 'utf8') },
    { name: 'xl/_rels/workbook.xml.rels', data: Buffer.from(wbRels, 'utf8') },
    { name: 'xl/styles.xml', data: Buffer.from(stylesXml(moedaFmt), 'utf8') },
    { name: 'xl/worksheets/sheet1.xml', data: Buffer.from(sheet1, 'utf8') },
    { name: 'xl/worksheets/sheet2.xml', data: Buffer.from(sheet2, 'utf8') }
  ]);
  return zip.toString('base64');
}

module.exports = { buildXlsx };

// teste standalone
if (require.main === module) {
  const meta = {
    moeda: 'USD', nome: 'Andre Amorim', label_periodo: 'mês atual', data_geracao: '04/07/2026',
    gastos: [
      { data: '30/06/2026', descricao: 'Consulta médica', categoria: 'saude', forma: 'cartao', valor: 180, obs: '' },
      { data: '01/07/2026', descricao: 'Uber aeroporto', categoria: 'transporte', forma: '', valor: 45.9, obs: '' },
      { data: '02/07/2026', descricao: 'Mercado semanal', categoria: 'alimentacao', forma: 'cartao', valor: 230.5, obs: '' },
      { data: '03/07/2026', descricao: 'Alex - Limpeza de terreno e showroom', categoria: 'profissional', forma: 'transferencia', valor: 1280, obs: 'Derrubada de árvores e remoção de lixo' },
      { data: '03/07/2026', descricao: 'Laercio (pago via Marchioni Custom Furniture) - serviço de construção', categoria: 'profissional', forma: '', valor: 8230, obs: 'Vidros, pedras e deck de madeira' }
    ]
  };
  const b64 = buildXlsx(meta);
  require('fs').writeFileSync(__dirname + '/relatorio-premium.xlsx', Buffer.from(b64, 'base64'));
  console.log('gerado, bytes:', Buffer.from(b64, 'base64').length);
}
