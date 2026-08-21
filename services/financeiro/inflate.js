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
  const novosOffsets = new Map();

  // headers locais na ordem FISICA original do arquivo (nao a do central directory)
  const ordemLocal = entradas.slice().sort((a, b) => a.lho - b.lho);
  for (const e of ordemLocal) {
    novosOffsets.set(e.nome, off);
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
    cd.writeUInt32LE(novosOffsets.get(e.nome), 42);
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
  require('./inflate.test.js')(module.exports);
}
