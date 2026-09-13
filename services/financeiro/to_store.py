#!/usr/bin/env python3
# Converte xlsx comprimido (deflate) para xlsx sem compressao (ZIP_STORED).
# Mantem a mesma ordem de entradas do arquivo original.
# Uso: python3 to_store.py entrada.xlsx [saida.store.xlsx]
import sys
import zipfile


def to_store(src, dst):
    with zipfile.ZipFile(src, 'r') as zin:
        with zipfile.ZipFile(dst, 'w', compression=zipfile.ZIP_STORED) as zout:
            for info in zin.infolist():
                data = zin.read(info.filename)
                novo = zipfile.ZipInfo(info.filename, date_time=info.date_time)
                novo.compress_type = zipfile.ZIP_STORED
                novo.external_attr = info.external_attr
                zout.writestr(novo, data)


if __name__ == '__main__':
    src = sys.argv[1]
    dst = sys.argv[2] if len(sys.argv) > 2 else src.replace('.xlsx', '.store.xlsx')
    to_store(src, dst)
    print(f'ok: {dst}')
