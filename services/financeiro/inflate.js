// inflate.js — INFLATE (RFC 1951) e conversao de zip DEFLATE -> STORE em JavaScript puro.
// Zero dependencias no caminho de producao: apenas Buffer. Sem zlib, sem fs, sem require.
// Motivo: os Code nodes do n8n bloqueiam require('zlib'), mas o Excel SEMPRE salva xlsx
// com DEFLATE — e o motor xlsx-patch.js so opera em zip STORE. Este modulo faz a ponte:
// converterParaStore(bufXlsx) descomprime tudo e remonta o zip em STORE, preservando
// nomes, ordem, atributos, timestamps e CRC de cada entrada.
'use strict';

// ---------------------------------------------------------------------------
// CRC32 (tabela padrao, polinomio 0xEDB88320) — mesma do xlsx-patch.js.
// Duplicada de proposito: cada arquivo precisa ser colavel sozinho num Code node.
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
// Tabelas fixas do RFC 1951
// ---------------------------------------------------------------------------

// Comprimentos (simbolos 257..285) — secao 3.2.5
const TAM_BASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59,
  67, 83, 99, 115, 131, 163, 195, 227, 258];
const TAM_EXTRA = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3,
  4, 4, 4, 4, 5, 5, 5, 5, 0];

// Distancias (simbolos 0..29) — secao 3.2.5
const DIST_BASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769,
  1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
const DIST_EXTRA = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8,
  9, 9, 10, 10, 11, 11, 12, 12, 13, 13];

// Ordem em que os comprimentos do alfabeto de code lengths aparecem — secao 3.2.7
const ORDEM_CLEN = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

const RAIZ = 9;                 // bits do lookup rapido de Huffman
const RAIZ_MASK = (1 << RAIZ) - 1;
const MAX_BITS = 15;            // comprimento maximo de um codigo Huffman no deflate
const JANELA_MAX = 32768;       // janela de back-reference (secao 3.2.5)

// ---------------------------------------------------------------------------
// Huffman canonico: contagens + simbolos (decodificacao bit a bit, sempre correta)
// + tabela de lookup de RAIZ bits (caminho rapido para os codigos curtos).
// ---------------------------------------------------------------------------
function construirHuffman(lengths, num, rotulo) {
  const count = new Int32Array(MAX_BITS + 1);
  for (let i = 0; i < num; i++) count[lengths[i]]++;
  count[0] = 0;

  // Kraft: rejeita arvore sobre-subscrita. Arvore INCOMPLETA e tolerada de proposito —
  // o zlib gera arvore de distancia com 1 unico codigo (ex: strategy RLE) e isso e legal;
  // um codigo invalido dentro dela estoura no decode, nao aqui.
  let restante = 1;
  for (let len = 1; len <= MAX_BITS; len++) {
    restante <<= 1;
    restante -= count[len];
    if (restante < 0) {
      throw new Error(`deflate invalido: arvore huffman '${rotulo}' sobre-subscrita no comprimento ${len}`);
    }
  }

  // simbolos ordenados por (comprimento, indice do simbolo) = ordem canonica
  const offs = new Int32Array(MAX_BITS + 2);
  for (let len = 1; len <= MAX_BITS; len++) offs[len + 1] = offs[len] + count[len];
  const symbol = new Int32Array(offs[MAX_BITS + 1]);
  const cursor = offs.slice();
  for (let i = 0; i < num; i++) {
    if (lengths[i]) symbol[cursor[lengths[i]]++] = i;
  }

  // tabela de lookup: indexada pelos proximos RAIZ bits do fluxo (ordem LSB-first),
  // valor = (comprimento << 16) | simbolo. Zero = "codigo maior que RAIZ bits" -> caminho lento.
  const table = new Int32Array(1 << RAIZ);
  const proximo = new Int32Array(MAX_BITS + 1);
  let code = 0;
  for (let len = 1; len <= MAX_BITS; len++) {
    code = (code + count[len - 1]) << 1;
    proximo[len] = code;
  }
  for (let i = 0; i < num; i++) {
    const len = lengths[i];
    if (len === 0) continue;
    const c = proximo[len]++;
    if (len > RAIZ) continue;
    // o fluxo entrega o codigo com o bit MAIS significativo primeiro, mas lemos LSB-first:
    // o indice da tabela e o codigo com os bits invertidos.
    let rev = 0;
    for (let b = 0; b < len; b++) rev |= ((c >>> (len - 1 - b)) & 1) << b;
    const valor = (len << 16) | i;
    for (let j = rev; j < table.length; j += (1 << len)) table[j] = valor;
  }

  return { count, symbol, table };
}

// tabelas fixas (BTYPE=01) — secao 3.2.6. Construidas uma vez.
const HUFF_FIXO_LIT = (() => {
  const l = new Uint8Array(288);
  for (let i = 0; i < 144; i++) l[i] = 8;
  for (let i = 144; i < 256; i++) l[i] = 9;
  for (let i = 256; i < 280; i++) l[i] = 7;
  for (let i = 280; i < 288; i++) l[i] = 8;
  return construirHuffman(l, 288, 'literal fixa');
})();

const HUFF_FIXO_DIST = (() => {
  const l = new Uint8Array(32);
  for (let i = 0; i < 32; i++) l[i] = 5;
  return construirHuffman(l, 32, 'distancia fixa');
})();

// ---------------------------------------------------------------------------
// inflateRaw: deflate CRU (sem header zlib/gzip), que e exatamente o que o zip guarda.
// tamanhoEsperado (opcional) vem do zip e serve para pre-alocar e validar.
// ---------------------------------------------------------------------------
function inflateRaw(buf, tamanhoEsperado) {
  if (!Buffer.isBuffer(buf) && !(buf instanceof Uint8Array)) {
    throw new Error('inflateRaw: esperado Buffer/Uint8Array');
  }
  const temHint = typeof tamanhoEsperado === 'number' && Number.isFinite(tamanhoEsperado) && tamanhoEsperado >= 0;

  // ---- saida (cresce dobrando; back-references leem o que ja foi escrito) ----
  let out = Buffer.allocUnsafe(temHint ? Math.max(tamanhoEsperado, 1) : Math.max(1024, buf.length * 4));
  let outLen = 0;
  function garantir(n) {
    if (outLen + n <= out.length) return;
    let cap = out.length || 1024;
    while (cap < outLen + n) cap *= 2;
    const novo = Buffer.allocUnsafe(cap);
    out.copy(novo, 0, 0, outLen);
    out = novo;
  }

  // ---- leitor de bits LSB-first (secao 3.1.1) ----
  let pos = 0;        // proximo byte a carregar (pode passar do fim: padding de zeros)
  let bitbuf = 0;
  let bitcnt = 0;
  let padding = 0;    // bytes de zero inventados apos o fim — indicam truncamento

  function precisa(n) {
    while (bitcnt < n) {
      let b;
      if (pos < buf.length) {
        b = buf[pos];
      } else {
        b = 0;
        padding++;
        // um peek legitimo no fim do fluxo puxa no maximo ~4 bytes de padding;
        // muito alem disso significa que os dados acabaram no meio de um bloco.
        if (padding > 16) throw new Error('deflate invalido: dados truncados antes do bloco final');
      }
      pos++;
      bitbuf |= b << bitcnt;
      bitcnt += 8;
    }
  }
  function pegarBits(n) {
    if (n === 0) return 0;
    precisa(n);
    const v = bitbuf & ((1 << n) - 1);
    bitbuf >>>= n;
    bitcnt -= n;
    return v;
  }

  // ---- decodificacao de um simbolo Huffman ----
  function decodificar(h) {
    precisa(RAIZ);
    const t = h.table[bitbuf & RAIZ_MASK];
    if (t !== 0) {
      const len = t >>> 16;
      bitbuf >>>= len;
      bitcnt -= len;
      return t & 0xFFFF;
    }
    // caminho lento: codigo com mais de RAIZ bits. Caminhada canonica bit a bit
    // (os bits ja "espiados" acima nao foram consumidos, entao recomecamos do 1o).
    let code = 0;
    let primeiro = 0;
    let indice = 0;
    for (let len = 1; len <= MAX_BITS; len++) {
      code |= pegarBits(1);
      const cnt = h.count[len];
      if (code - primeiro < cnt) return h.symbol[indice + (code - primeiro)];
      indice += cnt;
      primeiro = (primeiro + cnt) << 1;
      code <<= 1;
    }
    throw new Error('deflate invalido: codigo huffman fora de qualquer arvore');
  }

  // ---- corpo de um bloco comprimido (fixo ou dinamico) ----
  function blocoComprimido(hLit, hDist) {
    for (;;) {
      const sym = decodificar(hLit);
      if (sym < 256) {
        garantir(1);
        out[outLen++] = sym;
        continue;
      }
      if (sym === 256) return; // fim do bloco
      const iTam = sym - 257;
      if (iTam >= TAM_BASE.length) {
        throw new Error(`deflate invalido: simbolo de comprimento ${sym} nao existe (max 285)`);
      }
      const comprimento = TAM_BASE[iTam] + pegarBits(TAM_EXTRA[iTam]);

      const dsym = decodificar(hDist);
      if (dsym >= DIST_BASE.length) {
        throw new Error(`deflate invalido: simbolo de distancia ${dsym} nao existe (max 29)`);
      }
      const distancia = DIST_BASE[dsym] + pegarBits(DIST_EXTRA[dsym]);
      if (distancia > outLen) {
        throw new Error(`deflate invalido: distancia ${distancia} maior que os ${outLen} bytes ja descomprimidos`);
      }
      if (distancia > JANELA_MAX) {
        throw new Error(`deflate invalido: distancia ${distancia} excede a janela de 32768`);
      }

      garantir(comprimento);
      let de = outLen - distancia;
      if (distancia >= comprimento) {
        // regioes disjuntas: copia em bloco
        out.copy(out, outLen, de, de + comprimento);
        outLen += comprimento;
      } else {
        // SOBREPOSICAO (ex: distancia 1 = repetir o mesmo byte): tem que ser byte a byte,
        // porque cada byte copiado vira fonte dos proximos. memcpy/copy aqui daria resultado errado.
        for (let k = 0; k < comprimento; k++) out[outLen++] = out[de++];
      }
    }
  }

  // ---- laco principal de blocos (secao 3.2.3) ----
  let ultimo = 0;
  do {
    ultimo = pegarBits(1);
    const tipo = pegarBits(2);

    if (tipo === 0) {
      // ---- BTYPE=00: bloco armazenado (secao 3.2.4) ----
      // alinha no proximo byte. Nao da pra so zerar o buffer: o lookup de RAIZ bits
      // pode ter deixado mais de um byte inteiro em buffer, entao recalculamos a posicao real.
      const bitsConsumidos = pos * 8 - bitcnt;
      pos = Math.ceil(bitsConsumidos / 8);
      bitbuf = 0;
      bitcnt = 0;
      if (pos + 4 > buf.length) {
        throw new Error('deflate invalido: bloco stored sem LEN/NLEN completos');
      }
      const len = buf[pos] | (buf[pos + 1] << 8);
      const nlen = buf[pos + 2] | (buf[pos + 3] << 8);
      if (len !== (~nlen & 0xFFFF)) {
        throw new Error(`deflate invalido: bloco stored com NLEN inconsistente (LEN=${len}, NLEN=${nlen})`);
      }
      pos += 4;
      if (pos + len > buf.length) {
        throw new Error(`deflate invalido: bloco stored anuncia ${len} bytes mas o fluxo acabou`);
      }
      garantir(len);
      buf.copy ? buf.copy(out, outLen, pos, pos + len) : out.set(buf.subarray(pos, pos + len), outLen);
      outLen += len;
      pos += len;

    } else if (tipo === 1) {
      // ---- BTYPE=01: Huffman fixo ----
      blocoComprimido(HUFF_FIXO_LIT, HUFF_FIXO_DIST);

    } else if (tipo === 2) {
      // ---- BTYPE=10: Huffman dinamico (secao 3.2.7) ----
      const hlit = pegarBits(5) + 257;   // 257..286
      const hdist = pegarBits(5) + 1;    // 1..32
      const hclen = pegarBits(4) + 4;    // 4..19
      if (hlit > 286) throw new Error(`deflate invalido: HLIT=${hlit} acima de 286`);
      if (hdist > 30) throw new Error(`deflate invalido: HDIST=${hdist} acima de 30`);

      const lenClen = new Uint8Array(19);
      for (let i = 0; i < hclen; i++) lenClen[ORDEM_CLEN[i]] = pegarBits(3);
      const hClen = construirHuffman(lenClen, 19, 'code lengths');

      // os comprimentos de literal e distancia vem num unico fluxo, com repeticoes
      const lengths = new Uint8Array(hlit + hdist);
      let i = 0;
      while (i < lengths.length) {
        const sym = decodificar(hClen);
        if (sym < 16) {
          lengths[i++] = sym;
        } else {
          let valor = 0;
          let repete;
          if (sym === 16) {
            if (i === 0) throw new Error('deflate invalido: codigo 16 (repetir anterior) sem comprimento anterior');
            valor = lengths[i - 1];
            repete = 3 + pegarBits(2);   // 3..6
          } else if (sym === 17) {
            repete = 3 + pegarBits(3);   // 3..10 zeros
          } else {
            repete = 11 + pegarBits(7);  // 11..138 zeros
          }
          if (i + repete > lengths.length) {
            throw new Error(`deflate invalido: repeticao ${sym} estoura a tabela de comprimentos (${i}+${repete} > ${lengths.length})`);
          }
          while (repete--) lengths[i++] = valor;
        }
      }
      if (lengths[256] === 0) {
        throw new Error('deflate invalido: bloco dinamico sem codigo de fim de bloco (simbolo 256)');
      }

      const hLit = construirHuffman(lengths.subarray(0, hlit), hlit, 'literal dinamica');
      const hDist = construirHuffman(lengths.subarray(hlit), hdist, 'distancia dinamica');
      blocoComprimido(hLit, hDist);

    } else {
      throw new Error('deflate invalido: BTYPE=11 e reservado');
    }
  } while (!ultimo);

  // consumimos bits alem do fim real do buffer?
  if (pos - Math.floor(bitcnt / 8) > buf.length) {
    throw new Error('deflate invalido: o fluxo terminou antes do bloco final');
  }
  if (temHint && outLen !== tamanhoEsperado) {
    throw new Error(`deflate inconsistente: descomprimiu ${outLen} bytes mas o zip declara ${tamanhoEsperado}`);
  }
  return out.subarray(0, outLen);
}

// ---------------------------------------------------------------------------
// Zip: parser que aceita STORE (0) e DEFLATE (8).
// (o parseZip do xlsx-patch.js rejeita metodo != 0 de proposito; este e o irmao permissivo)
// ---------------------------------------------------------------------------
const SIG_EOCD = 0x06054b50;
const SIG_CENTRAL = 0x02014b50;
const SIG_LOCAL = 0x04034b50;
const SIG_EOCD64_LOC = 0x07064b50;

function acharEocd(buf) {
  const minimo = Math.max(0, buf.length - 22 - 65535);
  for (let i = buf.length - 22; i >= minimo; i--) {
    if (buf.readUInt32LE(i) === SIG_EOCD) return i;
  }
  throw new Error('zip invalido: End of Central Directory nao encontrado');
}

// Le o central directory inteiro, descomprimindo o que for DEFLATE.
// Devolve, para cada entrada, os bytes crus dos headers (para preservar atributos) e o conteudo.
function lerEntradasComprimidas(buf) {
  const eocdOffset = acharEocd(buf);
  if (eocdOffset >= 20 && buf.readUInt32LE(eocdOffset - 20) === SIG_EOCD64_LOC) {
    throw new Error('zip64 nao suportado (arquivo acima de 4GB ou com mais de 65535 entradas)');
  }
  const totalEntradas = buf.readUInt16LE(eocdOffset + 10);
  const cdOffset = buf.readUInt32LE(eocdOffset + 16);
  const entradas = [];
  let p = cdOffset;

  for (let i = 0; i < totalEntradas; i++) {
    if (p + 46 > buf.length || buf.readUInt32LE(p) !== SIG_CENTRAL) {
      throw new Error(`zip invalido: assinatura do central directory ausente na entrada ${i}`);
    }
    const flags = buf.readUInt16LE(p + 8);
    const metodo = buf.readUInt16LE(p + 10);
    const crcDeclarado = buf.readUInt32LE(p + 16);
    const compSize = buf.readUInt32LE(p + 20);
    const uncompSize = buf.readUInt32LE(p + 24);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const lho = buf.readUInt32LE(p + 42);
    const nome = buf.toString('utf8', p + 46, p + 46 + nameLen);

    if (compSize === 0xFFFFFFFF || uncompSize === 0xFFFFFFFF || lho === 0xFFFFFFFF) {
      throw new Error(`zip64 nao suportado (entrada '${nome}' usa campos estendidos)`);
    }
    if (flags & 0x01) {
      throw new Error(`entrada '${nome}' esta criptografada — nao suportado`);
    }
    if (lho + 30 > buf.length || buf.readUInt32LE(lho) !== SIG_LOCAL) {
      throw new Error(`zip invalido: local header ausente para '${nome}'`);
    }
    const lNameLen = buf.readUInt16LE(lho + 26);
    const lExtraLen = buf.readUInt16LE(lho + 28);
    const dataOffset = lho + 30 + lNameLen + lExtraLen;
    if (dataOffset + compSize > buf.length) {
      throw new Error(`zip invalido: dados de '${nome}' passam do fim do arquivo`);
    }

    const cru = buf.subarray(dataOffset, dataOffset + compSize);
    let conteudo;
    if (metodo === 0) {
      conteudo = cru;
      if (uncompSize !== compSize) {
        throw new Error(`zip invalido: '${nome}' e STORE mas tem tamanhos diferentes (${compSize} vs ${uncompSize})`);
      }
    } else if (metodo === 8) {
      conteudo = inflateRaw(cru, uncompSize);
    } else {
      throw new Error(`entrada '${nome}' usa metodo de compressao ${metodo}, nao suportado (so STORE=0 e DEFLATE=8)`);
    }

    // Prova independente de que o inflate acertou: o CRC do header tem que bater.
    const crcReal = crc32(conteudo);
    if (crcReal !== crcDeclarado) {
      throw new Error(`CRC divergente em '${nome}': calculado ${crcReal.toString(16)}, zip declara ${crcDeclarado.toString(16)}`);
    }

    entradas.push({
      nome,
      metodo,
      conteudo,
      crc: crcDeclarado,
      lho,
      cabecalhoLocal: buf.subarray(lho, dataOffset), // preserva versao, data/hora, nome e extra
      registroCentral: buf.subarray(p, p + 46 + nameLen + extraLen + commentLen),
    });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return { entradas, eocdOffset };
}

// ---------------------------------------------------------------------------
// converterParaStore: zip (DEFLATE e/ou STORE) -> zip 100% STORE.
// Preserva nome, ordem fisica das entradas, ordem do central directory, data/hora,
// atributos externos/internos, comentarios e CRC.
// ---------------------------------------------------------------------------
function converterParaStore(bufZip) {
  const { entradas, eocdOffset } = lerEntradasComprimidas(bufZip);

  const partes = [];
  let off = 0;

  // headers locais na ordem FISICA original do arquivo (nao a do central directory).
  // O novo offset vai no proprio objeto da entrada, e nao num Map por nome: zip aceita
  // nomes repetidos e um Map faria as duas entradas apontarem para o mesmo lugar.
  const ordemLocal = entradas.slice().sort((a, b) => a.lho - b.lho);
  for (const e of ordemLocal) {
    e.novoOffset = off;
    const lh = Buffer.from(e.cabecalhoLocal);
    lh.writeUInt16LE(lh.readUInt16LE(6) & ~0x08, 6); // desliga bit 3: sem data descriptor
    lh.writeUInt16LE(0, 8);                          // metodo = STORE
    lh.writeUInt32LE(e.crc, 14);
    lh.writeUInt32LE(e.conteudo.length, 18);         // compressed = uncompressed
    lh.writeUInt32LE(e.conteudo.length, 22);
    partes.push(lh, e.conteudo);
    off += lh.length + e.conteudo.length;
  }

  // central directory na ordem original, com offsets/metodo/tamanhos corrigidos
  const cdStart = off;
  for (const e of entradas) {
    const cd = Buffer.from(e.registroCentral);
    cd.writeUInt16LE(cd.readUInt16LE(8) & ~0x08, 8);
    cd.writeUInt16LE(0, 10);
    cd.writeUInt32LE(e.crc, 16);
    cd.writeUInt32LE(e.conteudo.length, 20);
    cd.writeUInt32LE(e.conteudo.length, 24);
    cd.writeUInt32LE(e.novoOffset, 42);
    partes.push(cd);
    off += cd.length;
  }

  // EOCD original (inclusive comentario), com tamanho/offset do central directory corrigidos
  const eocd = Buffer.from(bufZip.subarray(eocdOffset));
  eocd.writeUInt32LE(off - cdStart, 12);
  eocd.writeUInt32LE(cdStart, 16);
  partes.push(eocd);

  return Buffer.concat(partes);
}

module.exports = { inflateRaw, converterParaStore, crc32 };

// ---------------------------------------------------------------------------
// Harness de teste (roda com: node inflate.js) — fs/child_process SO aqui dentro.
// ---------------------------------------------------------------------------
if (require.main === module) {
  const fs = require('fs');
  const path = require('path');
  const zlib = require('zlib'); // SO no harness: oraculo independente. Producao nunca toca nisso.
  const { spawnSync } = require('child_process');

  const DIR = process.env.FIN_DIR ||
    '/tmp/claude-0/-home-user-thiagoteste/46e0e517-f29e-5e6f-b738-f2e0a8076033/scratchpad/fin';
  const AQUI = __dirname;

  let falhas = 0;
  function ok(cond, rotulo, detalhe) {
    if (cond) console.log(`  PASS ${rotulo}${detalhe ? ' — ' + detalhe : ''}`);
    else { falhas++; console.log(`  FAIL ${rotulo}${detalhe ? ' — ' + detalhe : ''}`); }
  }
  function carregar(nome) { return fs.readFileSync(path.join(DIR, nome)); }
  function rodarPython(codigo) {
    const r = spawnSync('python3', ['-'], { input: codigo, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    return { out: (r.stdout || '').trim(), err: (r.stderr || '').trim(), status: r.status };
  }
  const fmt = (n) => n.toLocaleString('pt-BR');

  // Leitor de zip STORE independente (nao usa o codigo em teste) para conferir a saida.
  function entradasStore(buf) {
    let eocd = -1;
    for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 65535); i--) {
      if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('EOCD nao encontrado');
    const total = buf.readUInt16LE(eocd + 10);
    let p = buf.readUInt32LE(eocd + 16);
    const lista = [];
    for (let i = 0; i < total; i++) {
      const metodo = buf.readUInt16LE(p + 10);
      const crc = buf.readUInt32LE(p + 16);
      const compSize = buf.readUInt32LE(p + 20);
      const uncompSize = buf.readUInt32LE(p + 24);
      const nameLen = buf.readUInt16LE(p + 28);
      const extraLen = buf.readUInt16LE(p + 30);
      const commentLen = buf.readUInt16LE(p + 32);
      const lho = buf.readUInt32LE(p + 42);
      const nome = buf.toString('utf8', p + 46, p + 46 + nameLen);
      const dataOff = lho + 30 + buf.readUInt16LE(lho + 26) + buf.readUInt16LE(lho + 28);
      lista.push({
        nome, metodo, crc, compSize, uncompSize, lho,
        dados: buf.subarray(dataOff, dataOff + compSize),
        hora: buf.readUInt16LE(p + 12), data: buf.readUInt16LE(p + 14),
        externo: buf.readUInt32LE(p + 38),
      });
      p += 46 + nameLen + extraLen + commentLen;
    }
    return lista;
  }

  const ARQUIVOS = ['lojao', 'horizon', 'controle-obras', 'epdm-antigo', 'stress-grande'];
  const PRINCIPAIS = ['lojao', 'horizon', 'controle-obras', 'epdm-antigo'];

  // ---- fixtures: gera se nao existirem (o scratchpad e reciclado periodicamente) ----
  if (!ARQUIVOS.every((n) => fs.existsSync(path.join(DIR, n + '.xlsx')) &&
                             fs.existsSync(path.join(DIR, n + '.store.xlsx')))) {
    console.log('== Gerando fixtures (openpyxl) ==');
    const g = spawnSync('python3', [path.join(AQUI, 'gerar-fixtures-teste.py'), DIR], { encoding: 'utf8' });
    if (g.status !== 0) {
      console.log('NAO FOI POSSIVEL GERAR OS FIXTURES:\n' + (g.stderr || ''));
      process.exit(1);
    }
    console.log(g.stdout.trim().split('\n').map((l) => '  ' + l).join('\n'));
  }

  console.log('\n== Testes inflate (RFC 1951) ==');

  // =========================================================================
  // (0) Conformidade do inflateRaw contra o zlib (oraculo independente).
  //     Cobre BTYPE 00/01/10, todas as estrategias e sobreposicao patologica.
  // =========================================================================
  console.log('[0. conformidade RFC 1951 vs zlib]');
  {
    const estrategias = [
      ['DEFAULT', zlib.constants.Z_DEFAULT_STRATEGY], ['FILTERED', zlib.constants.Z_FILTERED],
      ['HUFFMAN_ONLY', zlib.constants.Z_HUFFMAN_ONLY], ['RLE', zlib.constants.Z_RLE],
      ['FIXED', zlib.constants.Z_FIXED],
    ];
    let s = 12345;
    const prng = () => (s = (s * 1103515245 + 12345) >>> 0);
    const ruido = Buffer.alloc(300000);
    for (let i = 0; i < ruido.length; i++) ruido[i] = (prng() >>> 16) & 255;

    const amostras = {
      vazio: Buffer.alloc(0),
      umByte: Buffer.from([0x41]),
      zeros64k: Buffer.alloc(65536),                                  // distancia 1: sobreposicao maxima
      rle100k: Buffer.alloc(100000, 0x5A),
      repetido: Buffer.from('abcabcabc'.repeat(20000)),               // sobreposicao dist=3
      xmlish: Buffer.from('<row r="12"><c r="A12" s="5"><v>1</v></c></row>'.repeat(4000)),
      utf8: Buffer.from('GERADOR DE OZÔNIO — André, Maricá, Configurações. '.repeat(3000), 'utf8'),
      ruido,                                                          // incompressivel: forca blocos stored
    };

    let casos = 0, ruins = 0;
    const testar = (dados, opts) => {
      casos++;
      const comp = zlib.deflateRawSync(dados, opts);
      try {
        const saida = inflateRaw(comp, dados.length);
        if (!Buffer.from(saida).equals(Buffer.from(dados))) ruins++;
      } catch (e) { ruins++; }
    };
    for (const dados of Object.values(amostras)) {
      for (let nivel = 0; nivel <= 9; nivel++) {
        for (const [, est] of estrategias) testar(dados, { level: nivel, strategy: est });
      }
      for (const wb of [9, 10, 12, 15]) testar(dados, { windowBits: wb, level: 9 });
      for (const ml of [1, 4, 9]) testar(dados, { memLevel: ml, level: 9 });
    }
    for (let t = 0; t < 3000; t++) {   // fuzz: bordas de bloco e arvores incompletas
      const n = t % 300;
      const b = Buffer.alloc(n);
      for (let i = 0; i < n; i++) b[i] = (t % 3 === 0) ? ((prng() >>> 16) & 3) : ((prng() >>> 16) & 255);
      testar(b, { level: t % 10, strategy: estrategias[t % 5][1] });
    }
    ok(ruins === 0, 'inflateRaw == zlib.inflateRaw', `${fmt(casos)} casos (niveis 0-9 x 5 estrategias x 8 perfis + windowBits/memLevel + 3000 fuzz), ${ruins} divergencias`);

    // blocos stored explicitos (BTYPE=00) e Huffman fixo (BTYPE=01) confirmados no fluxo
    const soStored = zlib.deflateRawSync(ruido.subarray(0, 200000), { level: 0 });
    ok((soStored[0] & 0x06) === 0, 'BTYPE=00 (stored) exercitado', `primeiro bloco tipo ${(soStored[0] >> 1) & 3}`);
    ok(inflateRaw(soStored, 200000).equals(ruido.subarray(0, 200000)), 'bloco stored 200.000 bytes exato');
    const soFixo = zlib.deflateRawSync(Buffer.from('aaaa bbbb aaaa bbbb'), { strategy: zlib.constants.Z_FIXED });
    ok(((soFixo[0] >> 1) & 3) === 1, 'BTYPE=01 (huffman fixo) exercitado', `tipo ${(soFixo[0] >> 1) & 3}`);
    const dinamico = zlib.deflateRawSync(amostras.xmlish, { level: 9 });
    ok(((dinamico[0] >> 1) & 3) === 2, 'BTYPE=10 (huffman dinamico) exercitado', `tipo ${(dinamico[0] >> 1) & 3}`);

    // sobreposicao: dist < comprimento tem que copiar byte a byte
    const overlap = inflateRaw(zlib.deflateRawSync(Buffer.from('XY'.repeat(50000))), 100000);
    ok(overlap.length === 100000 && overlap.toString().startsWith('XYXYXY') &&
       overlap[99998] === 0x58 && overlap[99999] === 0x59, 'back-reference com sobreposicao (dist=2 < len)');
  }

  // =========================================================================
  // (a) converterParaStore: conteudo de CADA entrada identico ao gabarito Python
  // =========================================================================
  console.log('\n[a. conteudo vs gabarito .store.xlsx (byte a byte)]');
  const convertidos = {};
  for (const nome of ARQUIVOS) {
    const bufDeflate = carregar(nome + '.xlsx');
    const bufGabarito = carregar(nome + '.store.xlsx');
    const saida = converterParaStore(bufDeflate);
    convertidos[nome] = saida;
    fs.writeFileSync(path.join(DIR, nome + '.js-store.xlsx'), saida);

    const gab = entradasStore(bufGabarito);
    const nova = entradasStore(saida);
    const orig = entradasStore(bufDeflate);

    const mapaGab = new Map(gab.map((e) => [e.nome, e]));
    let divergentes = [];
    let bytesConferidos = 0;
    for (const e of nova) {
      const g = mapaGab.get(e.nome);
      if (!g) { divergentes.push(e.nome + ' (ausente no gabarito)'); continue; }
      if (!e.dados.equals(g.dados)) divergentes.push(e.nome);
      else bytesConferidos += e.dados.length;
    }
    const ordemIgual = JSON.stringify(nova.map((e) => e.nome)) === JSON.stringify(orig.map((e) => e.nome));
    const todosStore = nova.every((e) => e.metodo === 0);
    ok(divergentes.length === 0 && nova.length === gab.length && ordemIgual && todosStore,
      `${nome}: ${nova.length} entradas identicas ao gabarito`,
      `${fmt(bytesConferidos)} bytes conferidos${divergentes.length ? ', divergem: ' + divergentes.join(',') : ''}`);

    // metadados preservados (data/hora, atributos externos)
    const mapaOrig = new Map(orig.map((e) => [e.nome, e]));
    const metaOk = nova.every((e) => {
      const o = mapaOrig.get(e.nome);
      return o && o.hora === e.hora && o.data === e.data && o.externo === e.externo;
    });
    ok(metaOk, `${nome}: data/hora e atributos externos preservados`);
  }

  // =========================================================================
  // (b) CRC32 de cada entrada da saida == CRC do header ORIGINAL
  // =========================================================================
  console.log('\n[b. CRC32 vs header original (prova independente do inflate)]');
  for (const nome of ARQUIVOS) {
    const orig = entradasStore(carregar(nome + '.xlsx'));
    const nova = entradasStore(convertidos[nome]);
    const mapaOrig = new Map(orig.map((e) => [e.nome, e]));
    let ruins = [];
    for (const e of nova) {
      const o = mapaOrig.get(e.nome);
      const calculado = crc32(e.dados);
      if (calculado !== o.crc) ruins.push(`${e.nome}: ${calculado.toString(16)} != ${o.crc.toString(16)}`);
      if (e.crc !== o.crc) ruins.push(`${e.nome}: header de saida ${e.crc.toString(16)} != ${o.crc.toString(16)}`);
      if (e.uncompSize !== o.uncompSize) ruins.push(`${e.nome}: tamanho ${e.uncompSize} != ${o.uncompSize}`);
    }
    ok(ruins.length === 0, `${nome}: CRC + tamanho de ${nova.length} entradas batem com o original`,
      ruins.length ? ruins.slice(0, 3).join(' | ') : `ex: ${nova[0].nome} crc=${nova[0].crc.toString(16)}`);
  }

  // =========================================================================
  // (c) openpyxl: abas, TODAS as celulas, formulas e graficos
  // =========================================================================
  console.log('\n[c. openpyxl: abas, celulas, formulas, graficos]');
  {
    const alvos = PRINCIPAIS.map((n) => `(${JSON.stringify(n)}, r'${path.join(DIR, n + '.xlsx')}', r'${path.join(DIR, n + '.js-store.xlsx')}')`).join(',\n  ');
    const py = `
import openpyxl, json, warnings
warnings.simplefilter('ignore')
alvos = [
  ${alvos}
]
for nome, orig, conv in alvos:
    a = openpyxl.load_workbook(orig, data_only=False)
    b = openpyxl.load_workbook(conv, data_only=False)
    res = {'arquivo': nome}
    res['abas_iguais'] = a.sheetnames == b.sheetnames
    res['abas'] = a.sheetnames
    dif, cels, formulas = 0, 0, 0
    for s in a.sheetnames:
        wa, wbb = a[s], b[s]
        if wa.max_row != wbb.max_row or wa.max_column != wbb.max_column:
            dif += 1
            continue
        for ra, rb in zip(wa.iter_rows(), wbb.iter_rows()):
            for ca, cb in zip(ra, rb):
                if ca.value != cb.value or ca.data_type != cb.data_type:
                    dif += 1
                if ca.value is not None:
                    cels += 1
                    if isinstance(ca.value, str) and ca.value.startswith('='):
                        formulas += 1
    res['celulas_divergentes'] = dif
    res['celulas_comparadas'] = cels
    res['formulas'] = formulas
    res['graficos'] = {s: len(b[s]._charts) for s in b.sheetnames if len(b[s]._charts)}
    res['graficos_orig'] = {s: len(a[s]._charts) for s in a.sheetnames if len(a[s]._charts)}
    print(json.dumps(res, ensure_ascii=False))
`;
    const r = rodarPython(py);
    if (r.status !== 0) {
      ok(false, 'openpyxl falhou', r.err.split('\n').slice(-3).join(' | '));
    } else {
      for (const linha of r.out.split('\n')) {
        const j = JSON.parse(linha);
        ok(j.abas_iguais && j.celulas_divergentes === 0,
          `${j.arquivo}: ${j.abas.length} abas, ${fmt(j.celulas_comparadas)} celulas identicas ao original`,
          `${j.formulas} formulas preservadas | abas: ${j.abas.join(', ')}`);
        // contagem esperada por arquivo (o epdm-antigo, espelho antigo, nao tem grafico)
        const esperado = { lojao: { DASHBOARD: 1 }, horizon: { Dashboard: 1 },
          'controle-obras': { 'Resumo Geral': 2 }, 'epdm-antigo': {} }[j.arquivo];
        ok(JSON.stringify(j.graficos) === JSON.stringify(j.graficos_orig) &&
           JSON.stringify(j.graficos) === JSON.stringify(esperado),
          `${j.arquivo}: graficos preservados`,
          `${JSON.stringify(j.graficos)} (esperado ${JSON.stringify(esperado)})`);
      }
    }
    // zipfile: CRC integro e 100% STORE
    const rz = rodarPython(`
import zipfile, json
for nome in ${JSON.stringify(ARQUIVOS)}:
    p = r'${DIR}/' + nome + '.js-store.xlsx'
    z = zipfile.ZipFile(p)
    metodos = sorted(set(i.compress_type for i in z.infolist()))
    print(json.dumps({'nome': nome, 'crc_ok': z.testzip() is None,
                      'so_store': metodos == [0], 'metodos': metodos,
                      'entradas': len(z.infolist())}))
`);
    const linhasZip = rz.status === 0 ? rz.out.split('\n').map((l) => JSON.parse(l)) : [];
    ok(rz.status === 0 && linhasZip.length === ARQUIVOS.length &&
       linhasZip.every((j) => j.crc_ok && j.so_store),
      'zipfile: CRC integro e 100% STORE nos 5 convertidos',
      linhasZip.map((j) => `${j.nome}:${j.entradas} entradas`).join(' | ') || rz.err.slice(0, 200));
  }

  // =========================================================================
  // (d) o motor existente aceita a saida (nao pode dar "nao esta em formato STORE")
  // =========================================================================
  console.log('\n[d. xlsx-patch.js aceita a saida]');
  {
    const patch = require('./xlsx-patch.js');
    // antes: o motor REJEITA o xlsx comprimido do Excel — este e o problema que resolvemos
    try {
      patch.lerEntradas(carregar('lojao.xlsx'));
      ok(false, 'lerEntradas no xlsx DEFLATE deveria falhar');
    } catch (e) {
      ok(e.message.includes('STORE'), 'antes: motor rejeita o xlsx DEFLATE do Excel', e.message);
    }
    for (const nome of ARQUIVOS) {
      try {
        const ents = patch.lerEntradas(convertidos[nome]);
        ok(ents.has('xl/workbook.xml') && ents.size > 0,
          `depois: lerEntradas(${nome}) ok`, `${ents.size} entradas`);
      } catch (e) {
        ok(false, `depois: lerEntradas(${nome})`, e.message);
      }
    }
    // lerCelulas de verdade, com acentos no nome da aba e valores conhecidos
    const v = patch.lerCelulas(convertidos.lojao, 'VENDAS', 'A12:G12');
    ok(v.A12 && v.A12.valor === 1 && v.D12 && v.D12.valor === 'GERADOR DE OZÔNIO' &&
       v.C12 && v.C12.valor === '2000017343244900' && v.E12 && v.E12.valor === 3000,
      'lerCelulas(lojao, VENDAS, A12:G12)', JSON.stringify({ A12: v.A12.valor, C12: v.C12.valor, D12: v.D12.valor, E12: v.E12.valor }));
    const f = patch.lerCelulas(convertidos.lojao, 'VENDAS', ['H12']);
    ok(f.H12 && f.H12.tipo === 'formula' && f.H12.formula === 'F12-G12', 'formula lida apos conversao', JSON.stringify(f.H12));
    const ap = patch.lerCelulas(convertidos.horizon, 'Aportes Sócios', 'A12:E12');
    ok(ap.B12 && ap.B12.valor === 'Thiago' && ap.E12 && typeof ap.E12.valor === 'number',
      "lerCelulas(horizon, 'Aportes Sócios') — aba com acento", JSON.stringify({ B12: ap.B12.valor, E12: ap.E12.valor }));
    const ob = patch.lerCelulas(convertidos['controle-obras'], 'RJ Maricá', ['C8', 'C9']);
    ok(ob.C8 && ob.C8.valor === 'Sítio Maricá' && ob.C9 && ob.C9.valor === 'Maricá / RJ',
      "lerCelulas(controle-obras, 'RJ Maricá')", JSON.stringify({ C8: ob.C8.valor, C9: ob.C9.valor }));
    // o fluxo completo do n8n: Excel manda DEFLATE -> converte -> PATCHA -> le de volta
    const patchado = patch.patchCelulas(convertidos.lojao, 'VENDAS', [
      { ref: 'A31', valor: 20, tipo: 'numero' },
      { ref: 'B31', valor: '28/07/2026', tipo: 'data' },
      { ref: 'D31', valor: 'GERADOR DE OZÔNIO', tipo: 'texto' },
    ]);
    const relido = patch.lerCelulas(patchado, 'VENDAS', 'A31:D31');
    ok(relido.A31.valor === 20 && relido.B31.valor === 46231 && relido.D31.valor === 'GERADOR DE OZÔNIO',
      'fluxo completo: DEFLATE -> STORE -> patchCelulas -> releitura',
      JSON.stringify({ A31: relido.A31.valor, B31: relido.B31.valor, D31: relido.D31.valor }));
    fs.writeFileSync(path.join(DIR, 'lojao.js-store.patched.xlsx'), patchado);
    const vp = rodarPython(`
import openpyxl, datetime, warnings
warnings.simplefilter('ignore')
wb = openpyxl.load_workbook(r'${path.join(DIR, 'lojao.js-store.patched.xlsx')}', data_only=False)
v = wb['VENDAS']
print('A31', v['A31'].value)
print('B31_data', isinstance(v['B31'].value, datetime.datetime) and v['B31'].value.date() == datetime.date(2026,7,28))
print('D31', repr(v['D31'].value))
print('H31_f', repr(v['H31'].value))
print('graficos', len(wb['DASHBOARD']._charts))
`);
    ok(vp.status === 0 && vp.out.includes('A31 20') && vp.out.includes('B31_data True') &&
       vp.out.includes('graficos 1') && vp.out.includes("H31_f '=IF(OR(F31"),
      'openpyxl confirma o arquivo patchado (data, texto, formula e grafico)', vp.out.replace(/\n/g, ' | '));
  }

  // =========================================================================
  // (e) idempotencia: converter um zip que JA e STORE
  // =========================================================================
  console.log('\n[e. idempotencia sobre zip ja STORE]');
  for (const nome of PRINCIPAIS) {
    const jaStore = carregar(nome + '.store.xlsx');
    const r1 = converterParaStore(jaStore);
    const r2 = converterParaStore(r1);
    const gab = new Map(entradasStore(jaStore).map((e) => [e.nome, e]));
    const saiu = entradasStore(r1);
    const conteudoIgual = saiu.every((e) => gab.has(e.nome) && e.dados.equals(gab.get(e.nome).dados));
    ok(conteudoIgual && saiu.length === gab.size, `${nome}.store: conteudo preservado`, `${saiu.length} entradas`);
    ok(r1.equals(r2), `${nome}.store: converter 2x da o MESMO byte`, `${fmt(r1.length)} bytes`);
  }
  // zip misto (metade STORE, metade DEFLATE) — caso real de arquivo remontado
  {
    const misto = rodarPython(`
import zipfile
src = r'${path.join(DIR, 'lojao.xlsx')}'
dst = r'${path.join(DIR, 'lojao.misto.xlsx')}'
zin = zipfile.ZipFile(src)
with zipfile.ZipFile(dst, 'w') as zout:
    for i, info in enumerate(zin.infolist()):
        novo = zipfile.ZipInfo(info.filename, date_time=info.date_time)
        novo.compress_type = zipfile.ZIP_STORED if i % 2 else zipfile.ZIP_DEFLATED
        novo.external_attr = info.external_attr
        zout.writestr(novo, zin.read(info.filename))
z = zipfile.ZipFile(dst)
print('metodos', sorted(set(i.compress_type for i in z.infolist())))
`);
    ok(misto.status === 0 && misto.out.includes('[0, 8]'), 'gerou zip misto STORE+DEFLATE', misto.out);
    const conv = converterParaStore(carregar('lojao.misto.xlsx'));
    const gab = new Map(entradasStore(carregar('lojao.store.xlsx')).map((e) => [e.nome, e]));
    const saiu = entradasStore(conv);
    ok(saiu.every((e) => e.metodo === 0 && e.dados.equals(gab.get(e.nome).dados)),
      'zip misto convertido: todas as entradas STORE e corretas', `${saiu.length} entradas`);
  }

  // =========================================================================
  // (f) tempo e pico de memoria (medidos em processo filho: maxRSS real)
  // =========================================================================
  console.log('\n[f. tempo e pico de memoria]');
  {
    const script = `
const fs = require('fs');
const { converterParaStore } = require(${JSON.stringify(path.join(AQUI, 'inflate.js'))});
const buf = fs.readFileSync(process.argv[2]);
const base = process.resourceUsage().maxRSS;
const t0 = process.hrtime.bigint();
let saida;
const N = Number(process.argv[3]);
for (let i = 0; i < N; i++) saida = converterParaStore(buf);
const t1 = process.hrtime.bigint();
console.log(JSON.stringify({
  entrada: buf.length, saida: saida.length,
  ms: Number(t1 - t0) / 1e6 / N,
  maxRssMB: process.resourceUsage().maxRSS / 1024,
  baseRssMB: base / 1024,
}));
`;
    const scriptPath = path.join(DIR, '_medir.js');
    fs.writeFileSync(scriptPath, script);
    console.log('    arquivo            comprimido    expandido    tempo      MB/s    pico RSS');
    for (const nome of ARQUIVOS) {
      const reps = nome === 'stress-grande' ? 3 : 20;
      const r = spawnSync('node', [scriptPath, path.join(DIR, nome + '.xlsx'), String(reps)], { encoding: 'utf8' });
      if (r.status !== 0) { ok(false, `medicao ${nome}`, (r.stderr || '').slice(0, 300)); continue; }
      const m = JSON.parse(r.stdout.trim());
      const mbs = (m.saida / 1048576) / (m.ms / 1000);
      console.log(`    ${nome.padEnd(18)} ${fmt(m.entrada).padStart(9)} B ${fmt(m.saida).padStart(10)} B ` +
                  `${m.ms.toFixed(1).padStart(7)} ms ${mbs.toFixed(0).padStart(6)} ${m.maxRssMB.toFixed(0).padStart(8)} MB`);
      ok(m.ms < (nome === 'stress-grande' ? 3000 : 300), `${nome}: tempo dentro do orcamento do n8n`, `${m.ms.toFixed(1)} ms`);
    }
  }

  // =========================================================================
  // (g) matriz de compressao: o MESMO xlsx recomprimido em todos os niveis/estrategias
  // =========================================================================
  console.log('\n[g. matriz de compressao sobre xlsx real]');
  {
    const py = `
import zipfile, zlib, os, json
DIR = r'${DIR}'
combos = []
for nivel in range(10):
    for est_nome, est in [('DEFAULT', zlib.Z_DEFAULT_STRATEGY), ('FILTERED', zlib.Z_FILTERED),
                          ('HUFFMAN_ONLY', zlib.Z_HUFFMAN_ONLY), ('RLE', zlib.Z_RLE), ('FIXED', zlib.Z_FIXED)]:
        combos.append((nivel, est_nome, est))
saidas = []
for nome in ${JSON.stringify(PRINCIPAIS)}:
    zin = zipfile.ZipFile(os.path.join(DIR, nome + '.xlsx'))
    dados = [(i.filename, i.date_time, zin.read(i.filename)) for i in zin.infolist()]
    for nivel, est_nome, est in combos:
        dst = os.path.join(DIR, '_matriz.xlsx')
        # escreve o zip na mao para controlar nivel/estrategia do deflate
        with open(dst, 'wb') as fh:
            centrais, offs = [], []
            for fn, dt, raw in dados:
                co = zlib.compressobj(nivel, zlib.DEFLATED, -15, 9, est)
                comp = co.compress(raw) + co.flush()
                metodo = 8 if len(comp) < len(raw) else 0
                if metodo == 0: comp = raw
                crc = zlib.crc32(raw) & 0xffffffff
                nome_b = fn.encode('utf-8')
                offs.append(fh.tell())
                dosdate = ((dt[0]-1980)<<9)|(dt[1]<<5)|dt[2]
                dostime = (dt[3]<<11)|(dt[4]<<5)|(dt[5]//2)
                import struct
                fh.write(struct.pack('<IHHHHHIIIHH', 0x04034b50, 20, 0, metodo, dostime, dosdate,
                                     crc, len(comp), len(raw), len(nome_b), 0) + nome_b + comp)
                centrais.append(struct.pack('<IHHHHHHIIIHHHHHII', 0x02014b50, 20, 20, 0, metodo, dostime,
                                            dosdate, crc, len(comp), len(raw), len(nome_b), 0, 0, 0, 0, 0, offs[-1]) + nome_b)
            import struct
            cd_ini = fh.tell()
            for c in centrais: fh.write(c)
            cd_tam = fh.tell() - cd_ini
            fh.write(struct.pack('<IHHHHIIH', 0x06054b50, 0, 0, len(centrais), len(centrais), cd_tam, cd_ini, 0))
        os.rename(dst, os.path.join(DIR, f'_matriz_{nome}_{nivel}_{est_nome}.xlsx'))
        saidas.append(f'_matriz_{nome}_{nivel}_{est_nome}.xlsx')
print(json.dumps(saidas))
`;
    const r = rodarPython(py);
    if (r.status !== 0) {
      ok(false, 'geracao da matriz de compressao', r.err.split('\n').slice(-3).join(' | '));
    } else {
      const arqs = JSON.parse(r.out.split('\n').pop());
      let ruins = [];
      let totalEntradas = 0;
      const gabaritos = {};
      for (const n of PRINCIPAIS) gabaritos[n] = new Map(entradasStore(carregar(n + '.store.xlsx')).map((e) => [e.nome, e]));
      for (const a of arqs) {
        const base = a.match(/^_matriz_(.+?)_(\d+)_(\w+)\.xlsx$/);
        try {
          const conv = converterParaStore(carregar(a));
          const saiu = entradasStore(conv);
          const gab = gabaritos[base[1]];
          for (const e of saiu) {
            totalEntradas++;
            if (e.metodo !== 0 || !e.dados.equals(gab.get(e.nome).dados)) ruins.push(a + ':' + e.nome);
          }
        } catch (err) { ruins.push(a + ' EXCECAO ' + err.message); }
        fs.unlinkSync(path.join(DIR, a));
      }
      ok(ruins.length === 0,
        `${arqs.length} zips recomprimidos (4 xlsx x 10 niveis x 5 estrategias) conferem`,
        `${fmt(totalEntradas)} entradas verificadas${ruins.length ? ', ruins: ' + ruins.slice(0, 3).join(',') : ''}`);
    }
  }

  // =========================================================================
  // (h) erros: dados corrompidos precisam falhar alto, nunca devolver lixo
  // =========================================================================
  console.log('\n[h. deteccao de corrupcao]');
  {
    const esperaErro = (rotulo, fn, trecho) => {
      try { fn(); ok(false, rotulo + ' deveria lancar erro'); }
      catch (e) { ok(!trecho || e.message.includes(trecho), rotulo, e.message.slice(0, 110)); }
    };
    esperaErro('BTYPE=11 reservado', () => inflateRaw(Buffer.from([0x07, 0x00, 0x00, 0x00]), 10), 'BTYPE=11');
    esperaErro('deflate truncado', () => inflateRaw(zlib.deflateRawSync(Buffer.alloc(50000, 65)).subarray(0, 20), 50000));
    esperaErro('tamanho declarado errado', () => inflateRaw(zlib.deflateRawSync(Buffer.from('abc')), 999), 'zip declara');
    esperaErro('bloco stored com NLEN errado',
      () => { const b = Buffer.from([0x01, 0x05, 0x00, 0x00, 0x00, 1, 2, 3, 4, 5]); return inflateRaw(b); }, 'NLEN');
    // byte estragado no meio de uma entrada: ou o inflate acusa, ou o CRC pega
    const corrompido = Buffer.from(carregar('lojao.xlsx'));
    const ents = entradasStore(corrompido);
    const alvo = ents.find((e) => e.compSize > 500);
    const posByte = corrompido.indexOf(alvo.dados) + 100;
    corrompido[posByte] ^= 0xFF;
    esperaErro('byte corrompido no meio do deflate', () => converterParaStore(corrompido));
    // metodo nao suportado
    const bz = rodarPython(`
import zipfile, os
src = r'${path.join(DIR, 'epdm-antigo.xlsx')}'
dst = r'${path.join(DIR, '_bzip.xlsx')}'
zin = zipfile.ZipFile(src)
with zipfile.ZipFile(dst, 'w', compression=zipfile.ZIP_BZIP2) as zout:
    for i in zin.infolist(): zout.writestr(i.filename, zin.read(i.filename))
print('ok')
`);
    if (bz.status === 0) {
      esperaErro('metodo bzip2 (12) recusado', () => converterParaStore(carregar('_bzip.xlsx')), 'metodo de compressao');
    }
  }

  // =========================================================================
  // (i) data descriptor (flag bit 3): zips gravados em streaming deixam
  //     crc/tamanhos zerados no local header. Muito comum em geradores de xlsx.
  // =========================================================================
  console.log('\n[i. zip com data descriptor (flag bit 3)]');
  {
    const r = rodarPython(`
import zipfile, zlib, struct, os
src = r'${path.join(DIR, 'lojao.xlsx')}'
dst = r'${path.join(DIR, '_descriptor.xlsx')}'
zin = zipfile.ZipFile(src)
itens = [(i.filename, zin.read(i.filename)) for i in zin.infolist()]
with open(dst, 'wb') as fh:
    centrais = []
    for fn, raw in itens:
        co = zlib.compressobj(6, zlib.DEFLATED, -15)
        comp = co.compress(raw) + co.flush()
        crc = zlib.crc32(raw) & 0xffffffff
        nb = fn.encode('utf-8')
        off = fh.tell()
        # flag bit 3 ligado: crc e tamanhos ZERADOS no local header
        fh.write(struct.pack('<IHHHHHIIIHH', 0x04034b50, 20, 0x08, 8, 0, 0x5a21, 0, 0, 0, len(nb), 0))
        fh.write(nb); fh.write(comp)
        # data descriptor depois dos dados (com assinatura opcional)
        fh.write(struct.pack('<IIII', 0x08074b50, crc, len(comp), len(raw)))
        centrais.append(struct.pack('<IHHHHHHIIIHHHHHII', 0x02014b50, 20, 20, 0x08, 8, 0, 0x5a21,
                                    crc, len(comp), len(raw), len(nb), 0, 0, 0, 0, 0, off) + nb)
    ini = fh.tell()
    for c in centrais: fh.write(c)
    tam = fh.tell() - ini
    fh.write(struct.pack('<IHHHHIIH', 0x06054b50, 0, 0, len(centrais), len(centrais), tam, ini, 0))
z = zipfile.ZipFile(dst)
print('flags', sorted(set(i.flag_bits & 0x08 for i in z.infolist())), 'crc_ok', z.testzip() is None)
`);
    ok(r.status === 0 && r.out.includes('flags [8]') && r.out.includes('crc_ok True'),
      'gerou zip com data descriptor', r.out || r.err.split('\n').slice(-2).join(' '));
    if (r.status === 0) {
      const conv = converterParaStore(carregar('_descriptor.xlsx'));
      const gab = new Map(entradasStore(carregar('lojao.store.xlsx')).map((e) => [e.nome, e]));
      const saiu = entradasStore(conv);
      ok(saiu.length === gab.size && saiu.every((e) => e.metodo === 0 && e.dados.equals(gab.get(e.nome).dados)),
        'conteudo correto apesar do local header zerado', `${saiu.length} entradas`);
      ok(saiu.every((e) => e.crc !== 0 && e.uncompSize === gab.get(e.nome).uncompSize),
        'saida com crc/tamanhos reais e bit 3 desligado');
      const patch = require('./xlsx-patch.js');
      ok(patch.lerEntradas(conv).size === saiu.length, 'xlsx-patch aceita a saida');
    }
  }

  // =========================================================================
  // (j) sandbox n8n: sem require, sem process, sem fs, sem zlib — so Buffer.
  //     Reproduz o Code node onde o modulo vai rodar de verdade.
  // =========================================================================
  console.log('\n[j. sandbox estilo n8n Code node]');
  {
    const vm = require('vm');
    const fonte = fs.readFileSync(__filename, 'utf8').split('if (require.main === module)')[0];
    const ctx = { Buffer, module: { exports: {} } };
    ctx.exports = ctx.module.exports;
    vm.createContext(ctx);
    vm.runInContext(fonte, ctx, { filename: 'inflate-sandbox.js' });

    ok(ctx.require === undefined && ctx.process === undefined &&
       ctx.fs === undefined && ctx.zlib === undefined,
      'sandbox sem require/process/fs/zlib');
    const api = ctx.module.exports;
    ok(typeof api.inflateRaw === 'function' && typeof api.converterParaStore === 'function',
      'modulo carrega sem nenhum require', Object.keys(api).join(', '));

    let ruins = 0, entradas = 0;
    for (const nome of PRINCIPAIS) {
      const conv = api.converterParaStore(carregar(nome + '.xlsx'));
      const gab = new Map(entradasStore(carregar(nome + '.store.xlsx')).map((e) => [e.nome, e]));
      for (const e of entradasStore(conv)) {
        entradas++;
        if (e.metodo !== 0 || !e.dados.equals(gab.get(e.nome).dados)) ruins++;
      }
    }
    ok(ruins === 0, 'converterParaStore roda identico dentro do sandbox',
      `${entradas} entradas em ${PRINCIPAIS.length} arquivos, ${ruins} divergencias`);
  }

  console.log(falhas === 0 ? '\nTODOS OS TESTES PASSARAM' : `\n${falhas} TESTE(S) FALHARAM`);
  process.exit(falhas === 0 ? 0 : 1);
}
