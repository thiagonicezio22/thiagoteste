#!/usr/bin/env python3
# Reconstroi as 4 planilhas de teste a partir da estrutura documentada em
# docs/MANUAL-IA-FINANCEIRO.md (os originais viviam no scratchpad e foram reciclados).
# Gera .xlsx (DEFLATE, como o Excel salva) e .store.xlsx (gabarito, ZIP_STORED).
import sys, os, zipfile, datetime, random
import openpyxl
from openpyxl.styles import Font, PatternFill, Border, Side, Alignment
from openpyxl.chart import BarChart, LineChart, PieChart, Reference
from openpyxl.utils import get_column_letter

DIR = sys.argv[1]
os.makedirs(DIR, exist_ok=True)
random.seed(20260724)

AZUL = PatternFill('solid', fgColor='DDEBF7')
CINZA = PatternFill('solid', fgColor='F2F2F2')
VERDE = PatternFill('solid', fgColor='E2EFDA')
NEG = Font(bold=True)
TIT = Font(bold=True, size=14, color='1F4E79')
BORDA = Border(*[Side(style='thin', color='BFBFBF')] * 4)
CENTRO = Alignment(horizontal='center', vertical='center')

def cabecalho(ws, titulo, colunas, linha_hdr=11):
    ws['B2'] = titulo
    ws['B2'].font = TIT
    for i, nome in enumerate(colunas):
        c = ws.cell(row=linha_hdr, column=1 + i, value=nome)
        c.font = NEG
        c.fill = CINZA
        c.border = BORDA
        c.alignment = CENTRO

def estilizar_faixa(ws, l1, l2, c1, c2, fill):
    for l in range(l1, l2 + 1):
        for c in range(c1, c2 + 1):
            cel = ws.cell(row=l, column=c)
            cel.fill = fill
            cel.border = BORDA

# ---------------------------------------------------------------- ARQUIVO 1
def lojao(caminho):
    wb = openpyxl.Workbook()
    dash = wb.active
    dash.title = 'DASHBOARD'
    vendas = wb.create_sheet('VENDAS')
    custos = wb.create_sheet('Custos ENG')
    pag = wb.create_sheet('PAGAMENTOS ENG')
    compras = wb.create_sheet('COMPRAS E CUSTOS')

    cabecalho(vendas, 'CONTROLE DE VENDAS — LOJÃO AQUÁTICO',
              ['Nº', 'Data', 'Nº Venda ML', 'Produto', 'Modelo', 'Bruto', 'Recebido',
               'Tarifas', 'Custo ENG', 'Lucro', 'Margem', 'Mês'])
    produtos = ['GERADOR DE OZÔNIO', 'FILTRO UV 95W', 'VENTURI INOX', 'AQUAMAX 35000',
                'ENG MIX 3000', 'BOMBA TROPICAL', 'CLORADOR AUTOMÁTICO']
    modelos = [3000, 8000, 15000, 30000, 60000, 80000, 120000, 300000, 500000]
    base = datetime.date(2026, 1, 8)
    for i in range(19):
        l = 12 + i
        vendas.cell(row=l, column=1, value=i + 1)
        d = vendas.cell(row=l, column=2, value=base + datetime.timedelta(days=i * 9))
        d.number_format = 'DD/MM/YYYY'
        vendas.cell(row=l, column=3, value=str(2000017343244900 + i * 7))
        vendas.cell(row=l, column=4, value=produtos[i % len(produtos)])
        vendas.cell(row=l, column=5, value=modelos[i % len(modelos)])
        bruto = round(1200 + i * 137.45, 2)
        vendas.cell(row=l, column=6, value=bruto).number_format = '#,##0.00'
        vendas.cell(row=l, column=7, value=round(bruto * 0.828, 2)).number_format = '#,##0.00'
        vendas.cell(row=l, column=8, value=f'=F{l}-G{l}')
        vendas.cell(row=l, column=9, value=f"=IFERROR(VLOOKUP(E{l},'Custos ENG'!$B$9:$D$51,3,FALSE),0)")
        vendas.cell(row=l, column=10, value=f'=G{l}-I{l}')
        vendas.cell(row=l, column=11, value=f'=IF(F{l}=0,0,J{l}/F{l})')
        vendas.cell(row=l, column=12, value=f'=IF(B{l}="","",TEXT(B{l},"MMM/YY"))')
    # linhas 31..71 vazias mas ja com formulas H..L e estilo (igual ao arquivo real).
    # As celulas de data/moeda ja carregam o number_format: e isso que faz um serial
    # gravado depois pelo xlsx-patch aparecer como DATA no Excel.
    for l in range(31, 72):
        vendas.cell(row=l, column=2).number_format = 'DD/MM/YYYY'
        vendas.cell(row=l, column=6).number_format = '#,##0.00'
        vendas.cell(row=l, column=7).number_format = '#,##0.00'
        vendas.cell(row=l, column=8, value=f'=IF(OR(F{l}="",G{l}=""),"",F{l}-G{l})')
        vendas.cell(row=l, column=9, value=f"=IFERROR(VLOOKUP(E{l},'Custos ENG'!$B$9:$D$51,3,FALSE),0)")
        vendas.cell(row=l, column=10, value=f'=IF(G{l}="","",G{l}-I{l})')
        vendas.cell(row=l, column=11, value=f'=IF(F{l}="","",IF(F{l}=0,0,J{l}/F{l}))')
        vendas.cell(row=l, column=12, value=f'=IF(B{l}="","",TEXT(B{l},"MMM/YY"))')
    estilizar_faixa(vendas, 12, 71, 1, 7, AZUL)
    estilizar_faixa(vendas, 12, 71, 8, 12, VERDE)

    cabecalho(custos, 'TABELA EXECUTIVA ENG', ['', 'Chave', 'Equipamento', 'Custo'], linha_hdr=8)
    chaves = modelos + ['UV 95W', 'VENTURI', 'AQUAMAX 35000', 'ENG MIX']
    for i in range(43):
        l = 9 + i
        custos.cell(row=l, column=2, value=chaves[i % len(chaves)] if i < len(chaves) else 1000 * (i + 1))
        custos.cell(row=l, column=3, value=f'Equipamento executivo linha {i + 1}')
        custos.cell(row=l, column=4, value=round(380 + i * 41.7, 2)).number_format = '#,##0.00'
    estilizar_faixa(custos, 9, 51, 2, 4, AZUL)

    cabecalho(pag, 'PAGAMENTOS ENG (ANTONIO)', ['Data', 'Valor', 'Descrição'])
    pag['B8'] = '=SUM(VENDAS!I12:I71)'
    pag['D8'] = '=SUM(B12:B41)'
    pag['B9'] = '=B8-D8'
    for i in range(9):
        l = 12 + i
        pag.cell(row=l, column=1, value=base + datetime.timedelta(days=i * 21)).number_format = 'DD/MM/YYYY'
        pag.cell(row=l, column=2, value=round(1934.54 + i * 88.1, 2)).number_format = '#,##0.00'
        pag.cell(row=l, column=3, value=f'Repasse ENG parcela {i + 1}')
    estilizar_faixa(pag, 12, 41, 1, 3, AZUL)

    cabecalho(compras, 'COMPRAS E CUSTOS', ['Data', 'Item', 'Valor', 'Status', 'Obs'], linha_hdr=17)
    itens = ['Embalagens', 'Contabilidade', 'Frete', 'Etiquetas', 'Anúncio ML', 'Fita adesiva']
    for i in range(15):
        l = 18 + i
        compras.cell(row=l, column=1, value=base + datetime.timedelta(days=i * 13)).number_format = 'DD/MM/YYYY'
        compras.cell(row=l, column=2, value=f'{itens[i % len(itens)]} lote {i + 1}')
        compras.cell(row=l, column=3, value=round(140 + i * 63.2, 2)).number_format = '#,##0.00'
        compras.cell(row=l, column=4, value='Pago' if i % 3 else 'EM ANDAMENTO')
        compras.cell(row=l, column=5, value='Compra operacional do Lojão')
    for i in range(8):
        l = 38 + i
        compras.cell(row=l, column=2, value=f'Custo mensal recorrente {i + 1}')
        compras.cell(row=l, column=3, value=250 + i * 30)
    estilizar_faixa(compras, 18, 32, 1, 5, AZUL)

    # dashboard: formulas + 1 grafico
    dash['B2'] = 'DASHBOARD — LOJÃO AQUÁTICO'
    dash['B2'].font = TIT
    rotulos = ['Recebido total', 'Lucro total', 'Margem média', 'Vendas', 'Ticket médio',
               'Custo ENG total', 'Tarifas ML', 'Compras', 'Caixa', 'Pago ao Antonio']
    formulas = ['=SUM(VENDAS!G12:G71)', '=SUM(VENDAS!J12:J71)', '=IFERROR(AVERAGE(VENDAS!K12:K71),0)',
                '=COUNT(VENDAS!A12:A71)', '=IFERROR(B4/B7,0)', '=SUM(VENDAS!I12:I71)',
                '=SUM(VENDAS!H12:H71)', "='COMPRAS E CUSTOS'!C18", '=B4-B11-B9',
                "=SUM('PAGAMENTOS ENG'!B12:B41)"]
    for i, (r, f) in enumerate(zip(rotulos, formulas)):
        dash.cell(row=4 + i, column=1, value=r).font = NEG
        dash.cell(row=4 + i, column=2, value=f).number_format = '#,##0.00'
    for i in range(12):
        dash.cell(row=20 + i, column=1, value=f'Mês {i + 1}')
        dash.cell(row=20 + i, column=2, value=f'=SUMIF(VENDAS!$L$12:$L$71,A{20 + i},VENDAS!$G$12:$G$71)')
        dash.cell(row=20 + i, column=3, value=round(2000 + i * 430.5, 2))
    ch = BarChart()
    ch.title = 'Recebido por mês'
    ch.add_data(Reference(dash, min_col=3, min_row=20, max_row=31), titles_from_data=False)
    ch.set_categories(Reference(dash, min_col=1, min_row=20, max_row=31))
    dash.add_chart(ch, 'E4')

    wb.save(caminho)

# ---------------------------------------------------------------- ARQUIVO 2
def horizon(caminho):
    wb = openpyxl.Workbook()
    dash = wb.active
    dash.title = 'Dashboard'
    ap = wb.create_sheet('Aportes Sócios')
    desp = wb.create_sheet('Despesas')
    vend = wb.create_sheet('Vendas')
    comp = wb.create_sheet('Compromissos Futuros')
    acerto = wb.create_sheet('Acerto Sócios')
    cfg = wb.create_sheet('Configurações')

    cabecalho(ap, 'APORTES DOS SÓCIOS — HORIZON POOLS AND LAGOONS',
              ['Data', 'Sócio', 'Descrição', 'Forma', 'Valor', 'Acumulado'])
    socios = ['Thiago', 'André']
    base = datetime.date(2026, 5, 14)
    for i in range(12):
        l = 12 + i
        ap.cell(row=l, column=1, value=base + datetime.timedelta(days=i * 5)).number_format = 'DD/MM/YYYY'
        ap.cell(row=l, column=2, value=socios[0] if i % 4 == 0 else socios[1])
        ap.cell(row=l, column=3, value=f'Aporte para capital de giro — parcela {i + 1}')
        ap.cell(row=l, column=4, value='PIX' if i % 2 else 'TED')
        ap.cell(row=l, column=5, value=2400 if i == 11 else round(3200 + i * 611.3, 2))
        ap.cell(row=l, column=6, value=f'=IF(E{l}="","",SUM($E$12:E{l}))')
    for l in range(24, 62):
        ap.cell(row=l, column=6, value=f'=IF(E{l}="","",SUM($E$12:E{l}))')
    estilizar_faixa(ap, 12, 61, 1, 5, AZUL)

    cabecalho(desp, 'DESPESAS', ['Data', 'Categoria', 'Descrição', 'Fornecedor', 'Forma',
                                 'Valor', 'Pago por', 'Status', 'Rateio Thiago', 'Rateio André'])
    cats = ['Obra', 'Equipamento', 'Frete', 'Serviço', 'Imposto', 'Administrativo', 'Marketing']
    forns = ['ENG Soluções', 'Pedra Bonita Ltda', 'Arquiteto Rodrigo', 'Transportes Maricá',
             'JM Importações', 'Coral Home', 'Tropical Bombas']
    for i in range(100):
        l = 12 + i
        desp.cell(row=l, column=1, value=base + datetime.timedelta(days=i * 2)).number_format = 'DD/MM/YYYY'
        desp.cell(row=l, column=2, value=cats[i % len(cats)])
        desp.cell(row=l, column=3, value=f'{cats[i % len(cats)]} — lançamento {i + 1} referente à obra em execução')
        desp.cell(row=l, column=4, value=forns[i % len(forns)])
        desp.cell(row=l, column=5, value=['PIX', 'TED', 'Boleto', 'Cartão'][i % 4])
        desp.cell(row=l, column=6, value=round(310.5 + i * 97.23, 2)).number_format = '#,##0.00'
        desp.cell(row=l, column=7, value=['André', 'Thiago', 'Empresa'][i % 3])
        desp.cell(row=l, column=8, value='Pago' if i % 5 else 'Pendente')
        desp.cell(row=l, column=9, value=f"=F{l}*Configurações!$C$10")
        desp.cell(row=l, column=10, value=f"=F{l}*Configurações!$C$11")
    estilizar_faixa(desp, 12, 111, 1, 8, AZUL)
    estilizar_faixa(desp, 12, 111, 9, 10, VERDE)

    cabecalho(vend, 'VENDAS', ['Data', 'Cliente', 'Descrição', 'Bruto', 'Custos diretos',
                               'Lucro', 'Parte Thiago', 'Parte André', 'Retenção 25%',
                               'Saldo devedor', 'Status'])
    clientes = ['Condomínio Vista Azul', 'Gramoterra Paisagismo', 'Coral Home', 'Sítio Maricá',
                'Residência Itu', 'Hotel Praia Grande']
    for i in range(50):
        l = 12 + i
        vend.cell(row=l, column=1, value=base + datetime.timedelta(days=i * 4)).number_format = 'DD/MM/YYYY'
        vend.cell(row=l, column=2, value=clientes[i % len(clientes)])
        vend.cell(row=l, column=3, value=f'Lago ornamental / piscina praia — projeto {i + 1}')
        vend.cell(row=l, column=4, value=round(12000 + i * 1873.4, 2)).number_format = '#,##0.00'
        vend.cell(row=l, column=5, value=round(6100 + i * 903.2, 2)).number_format = '#,##0.00'
        vend.cell(row=l, column=6, value=f'=D{l}-E{l}')
        vend.cell(row=l, column=7, value=f"=F{l}*Configurações!$C$10")
        vend.cell(row=l, column=8, value=f"=F{l}*Configurações!$C$11")
        vend.cell(row=l, column=9, value=f"=F{l}*Configurações!$C$12")
        vend.cell(row=l, column=10, value=f'=IF(ROW()=12,I{l},J{l - 1}-I{l})')
        vend.cell(row=l, column=11, value='Recebido' if i % 3 else 'Pendente')
    estilizar_faixa(vend, 12, 61, 1, 5, AZUL)

    cabecalho(comp, 'COMPROMISSOS FUTUROS',
              ['Vencimento', 'Categoria', 'Descrição', 'Fornecedor', 'Forma', 'Valor', 'Status'])
    for i in range(12):
        l = 12 + i
        comp.cell(row=l, column=1, value=base + datetime.timedelta(days=30 + i * 11)).number_format = 'DD/MM/YYYY'
        comp.cell(row=l, column=2, value=cats[i % len(cats)])
        comp.cell(row=l, column=3, value=f'Compromisso futuro {i + 1}')
        comp.cell(row=l, column=4, value=forns[i % len(forns)])
        comp.cell(row=l, column=5, value='Boleto')
        comp.cell(row=l, column=6, value=round(4000 + i * 512.7, 2))
        comp.cell(row=l, column=7, value='Pendente' if i % 2 else 'EM REVISÃO')
    estilizar_faixa(comp, 12, 41, 1, 7, AZUL)

    acerto['B2'] = 'ACERTO ENTRE SÓCIOS'
    acerto['B2'].font = TIT
    for i, r in enumerate(['Aportes André', 'Aportes Thiago', 'Total investido', 'Saldo devedor',
                           'Retenções aplicadas', 'Saldo real em conta']):
        acerto.cell(row=10 + i, column=1, value=r).font = NEG
    acerto['B10'] = "=SUMIF('Aportes Sócios'!$B$12:$B$61,\"André\",'Aportes Sócios'!$E$12:$E$61)"
    acerto['B11'] = "=SUMIF('Aportes Sócios'!$B$12:$B$61,\"Thiago\",'Aportes Sócios'!$E$12:$E$61)"
    acerto['B12'] = '=B10+B11'
    acerto['B13'] = '=B10-B14'
    acerto['B14'] = '=SUM(Vendas!I12:I61)'
    acerto['B18'] = 7000
    acerto['B18'].fill = AZUL

    cfg['B2'] = 'CONFIGURAÇÕES'
    cfg['B2'].font = TIT
    for i, (r, v) in enumerate([('Participação Thiago', 0.5), ('Participação André', 0.5),
                                ('Retenção sobre lucro', 0.25), ('Câmbio US$', 5.50),
                                ('Contador mensal', 350.0)]):
        cfg.cell(row=10 + i, column=2, value=r)
        c = cfg.cell(row=10 + i, column=3, value=v)
        c.fill = AZUL
    # (C10, C11, C12, C13 conforme o manual)

    dash['B2'] = 'DASHBOARD — HORIZON'
    dash['B2'].font = TIT
    metricas = [
        ('Total investido', "='Acerto Sócios'!B12"), ('Aportes André', "='Acerto Sócios'!B10"),
        ('Aportes Thiago', "='Acerto Sócios'!B11"), ('% André', "=IFERROR(B5/B4,0)"),
        ('Saldo devedor', "='Acerto Sócios'!B13"), ('Despesas totais', '=SUM(Despesas!F12:F111)'),
        ('Despesas pagas', '=SUMIF(Despesas!H12:H111,"Pago",Despesas!F12:F111)'),
        ('Despesas pendentes', '=SUMIF(Despesas!H12:H111,"Pendente",Despesas!F12:F111)'),
        ('Vendas brutas', '=SUM(Vendas!D12:D61)'), ('Custos diretos', '=SUM(Vendas!E12:E61)'),
        ('Lucro bruto', '=SUM(Vendas!F12:F61)'), ('Parte Thiago', '=SUM(Vendas!G12:G61)'),
        ('Parte André', '=SUM(Vendas!H12:H61)'), ('Retenções', '=SUM(Vendas!I12:I61)'),
        ('Compromissos', "=SUM('Compromissos Futuros'!F12:F41)"),
        ('Saldo em conta', "='Acerto Sócios'!B18"),
    ]
    for i, (r, f) in enumerate(metricas):
        dash.cell(row=4 + i, column=1, value=r).font = NEG
        dash.cell(row=4 + i, column=2, value=f).number_format = '#,##0.00'
    for i in range(30):
        dash.cell(row=24 + i, column=1, value=f'Semana {i + 1}')
        dash.cell(row=24 + i, column=2, value=round(5000 + i * 812.4, 2))
        dash.cell(row=24 + i, column=3, value=f'=SUM($B$24:B{24 + i})')
    ch = LineChart()
    ch.title = 'Evolução dos aportes'
    ch.add_data(Reference(dash, min_col=2, min_row=24, max_row=53), titles_from_data=False)
    ch.set_categories(Reference(dash, min_col=1, min_row=24, max_row=53))
    dash.add_chart(ch, 'E4')

    wb.save(caminho)

# ---------------------------------------------------------------- ARQUIVO 3
def controle_obras(caminho):
    wb = openpyxl.Workbook()
    resumo = wb.active
    resumo.title = 'Resumo Geral'
    cal = wb.create_sheet('Calendário Recebimentos')
    ceq = wb.create_sheet('Custos Equipamentos')
    obras = {}
    for nome in ['RJ Maricá', 'Gramoterra', 'Itu', 'Obra em Branco 2', 'Obra em Branco 3']:
        obras[nome] = wb.create_sheet(nome)
    dash_epdm = wb.create_sheet('Dashboard EPDM')
    epdm_g = wb.create_sheet('EPDM Gramoterra')
    epdm_c = wb.create_sheet('EPDM Coral Home')

    cabecalho(ceq, 'CUSTOS DE EQUIPAMENTOS', ['', 'Equipamento', 'Unidade', 'Custo'], linha_hdr=8)
    equipamentos = ['Bomba Tropical 1/2CV', 'Filtro Nautilus', 'Skimmer inox', 'Iluminação LED RGB',
                    'Manta EPDM 1.14', 'Geotêxtil 300g', 'Aerador ENG', 'Casa de máquinas',
                    'Tubulação PVC 100', 'Quadro elétrico']
    for i, nome in enumerate(equipamentos):
        l = 9 + i
        ceq.cell(row=l, column=2, value=nome)
        ceq.cell(row=l, column=3, value='un')
        ceq.cell(row=l, column=4, value=round(850 + i * 412.3, 2)).number_format = '#,##0.00'
    estilizar_faixa(ceq, 9, 30, 2, 4, AZUL)

    def montar_obra(ws, cliente, cidade, contrato, gramoterra=False):
        ws['B2'] = f'OBRA — {cliente}'
        ws['B2'].font = TIT
        ws['C8'] = cliente
        ws['C9'] = cidade
        ws['I8'] = '66.319.861/0001-45'
        ws['C10'] = datetime.date(2026, 3, 12)
        ws['C10'].number_format = 'DD/MM/YYYY'
        for cel in ['C8', 'C9', 'I8', 'C10']:
            ws[cel].fill = AZUL
        cabecalho(ws, f'OBRA — {cliente}', ['', 'Parcela', 'Vencimento', 'Recebido em', 'Valor', '', 'Status'], linha_hdr=13)
        for i in range(6):
            l = 14 + i
            ws.cell(row=l, column=2, value=f'Parcela {i + 1}')
            ws.cell(row=l, column=3, value=datetime.date(2026, 4, 15) + datetime.timedelta(days=i * 30)).number_format = 'DD/MM/YYYY'
            if i < 4:
                ws.cell(row=l, column=4, value=datetime.date(2026, 4, 18) + datetime.timedelta(days=i * 30)).number_format = 'DD/MM/YYYY'
            ws.cell(row=l, column=5, value=round(contrato / 6, 2)).number_format = '#,##0.00'
            ws.cell(row=l, column=7, value='Recebido' if i < 4 else 'Pendente')
        estilizar_faixa(ws, 14, 19, 2, 7, AZUL)
        l1, l2 = (22, 29) if gramoterra else (27, 34)
        ws.cell(row=l1 - 1, column=2, value='Equipamento').font = NEG
        for i in range(8):
            l = l1 + i
            ws.cell(row=l, column=2, value=equipamentos[i % len(equipamentos)])
            ws.cell(row=l, column=3, value=1 + (i % 3))
            ws.cell(row=l, column=4, value=f"=IFERROR(VLOOKUP(B{l},'Custos Equipamentos'!$B$9:$D$30,3,FALSE),0)")
            ws.cell(row=l, column=5, value=0 if i % 2 else round(300 + i * 55.5, 2))
            ws.cell(row=l, column=6, value=f'=C{l}*IF(D{l}>0,D{l},E{l})')
        estilizar_faixa(ws, l1, l2, 2, 5, AZUL)
        ws['B36'] = 'Pago ENG'
        ws['F36'] = 25000
        ws['B37'] = 'Saldo ENG'
        ws['F37'] = f'=SUM(F{l1}:F{l2})+H39-F36'
        ws['C39'] = 4000
        ws['H39'] = 4000
        for cel in ['C42', 'E42', 'G42', 'I42']:
            ws[cel] = round(random.uniform(200, 900), 2)
            ws[cel].fill = AZUL
        ini_out, ini_val = (42, 42) if gramoterra else (47, 47)
        for i in range(5):
            ws.cell(row=ini_out + i, column=2, value=f'Custo avulso {i + 1}')
            ws.cell(row=ini_val + i, column=9, value=round(400 + i * 210.4, 2))
        r1 = 51 if gramoterra else 56
        rotulos = ['Contrato', 'Recebido', 'A receber', 'Custo equipamentos', 'Custos operacionais',
                   'NF 12%', 'Custo total', 'Lucro', 'Margem']
        for i, r in enumerate(rotulos):
            ws.cell(row=r1 + i, column=2, value=r).font = NEG
        ws.cell(row=r1, column=9, value=contrato)
        ws.cell(row=r1 + 1, column=9, value=f'=SUMIF($G$14:$G$19,"Recebido",$E$14:$E$19)')
        ws.cell(row=r1 + 2, column=9, value=f'=I{r1}-I{r1 + 1}')
        ws.cell(row=r1 + 3, column=9, value=f'=SUM(F{l1}:F{l2})')
        ws.cell(row=r1 + 4, column=9, value=f'=C39+H39+C42+E42+G42+I42+SUM(I{ini_val}:I{ini_val + 4})')
        ws.cell(row=r1 + 5, column=9, value=f'=I{r1}*0.12')
        ws.cell(row=r1 + 6, column=9, value=f'=I{r1 + 3}+I{r1 + 4}+I{r1 + 5}')
        ws.cell(row=r1 + 7, column=9, value=f'=I{r1}-I{r1 + 6}')
        ws.cell(row=r1 + 8, column=9, value=f'=IFERROR(I{r1 + 7}/I{r1},0)')

    montar_obra(obras['RJ Maricá'], 'Sítio Maricá', 'Maricá / RJ', 168000)
    montar_obra(obras['Gramoterra'], 'Gramoterra Paisagismo', 'Atibaia / SP', 74786.80, gramoterra=True)
    montar_obra(obras['Itu'], 'Residência Itu', 'Itu / SP', 40000)
    montar_obra(obras['Obra em Branco 2'], 'Cliente a definir', '', 0)
    montar_obra(obras['Obra em Branco 3'], 'Cliente a definir', '', 0)

    cabecalho(cal, 'CALENDÁRIO DE RECEBIMENTOS', ['Data', 'Obra', 'Parcela', 'Valor', 'Status'])
    nomes_obras = ['RJ Maricá', 'Gramoterra', 'Itu']
    for i in range(30):
        l = 12 + i
        cal.cell(row=l, column=1, value=datetime.date(2026, 4, 1) + datetime.timedelta(days=i * 10)).number_format = 'DD/MM/YYYY'
        cal.cell(row=l, column=2, value=nomes_obras[i % 3])
        cal.cell(row=l, column=3, value=f'Parcela {1 + i % 6}')
        cal.cell(row=l, column=4, value=round(9000 + i * 733.1, 2))
        cal.cell(row=l, column=5, value='Recebido' if i % 3 else 'Pendente')
    estilizar_faixa(cal, 12, 41, 1, 5, AZUL)

    epdm_g['B2'] = 'EPDM GRAMOTERRA'
    epdm_g['B2'].font = TIT
    for i in range(4):
        epdm_g.cell(row=6 + i, column=3, value=f'Custo importação etapa {i + 1}')
        epdm_g.cell(row=6 + i, column=4, value=round(12000 + i * 3100.5, 2)).fill = AZUL
    epdm_g['B14'] = 96000
    epdm_g['B15'] = 10000
    epdm_g['C15'] = 'PENDENTE'
    epdm_g['B17'] = '=B14-SUM(D6:D9)-B14*0.12'
    epdm_g['B18'] = '=B17/2'

    epdm_c['B2'] = 'EPDM CORAL HOME'
    epdm_c['B2'].font = TIT
    epdm_c['C6'] = 88000
    epdm_c['C7'] = 42000
    epdm_c['C10'] = 36576.34
    epdm_c['C11'] = '=(B19+B20)*0.12'
    epdm_c['B19'] = 120000
    epdm_c['B20'] = 60000
    epdm_c['B22'] = 95000
    epdm_c['C22'] = 'PENDENTE'
    epdm_c['B24'] = '=B19+B20-C6-C7-C10-C11'

    dash_epdm['B2'] = 'DASHBOARD EPDM'
    dash_epdm['B2'].font = TIT
    dash_epdm['B11'] = 20000
    dash_epdm['B12'] = "='EPDM Gramoterra'!B18+'EPDM Coral Home'!B24/2-B11"
    for i in range(10):
        dash_epdm.cell(row=16 + i, column=1, value=f'Operação {i + 1}')
        dash_epdm.cell(row=16 + i, column=2, value=round(8000 + i * 1500.25, 2))

    # Resumo Geral: metricas + 2 GRAFICOS (o ponto sensivel deste arquivo)
    resumo['B2'] = 'RESUMO GERAL — OBRAS E EPDM'
    resumo['B2'].font = TIT
    linhas = [('RJ Maricá', "='RJ Maricá'!I56", "='RJ Maricá'!I63"),
              ('Gramoterra', "=Gramoterra!I51", "=Gramoterra!I58"),
              ('Itu', "=Itu!I56", "=Itu!I63"),
              ('EPDM Gramoterra', "='EPDM Gramoterra'!B14", "='EPDM Gramoterra'!B18"),
              ('EPDM Coral Home', "='EPDM Coral Home'!B19", "='EPDM Coral Home'!B24")]
    resumo['A5'] = 'Obra'
    resumo['B5'] = 'Contrato'
    resumo['C5'] = 'Lucro'
    resumo['D5'] = 'Referência'
    for c in 'ABCD':
        resumo[c + '5'].font = NEG
        resumo[c + '5'].fill = CINZA
    for i, (nome, fc, fl) in enumerate(linhas):
        l = 6 + i
        resumo.cell(row=l, column=1, value=nome)
        resumo.cell(row=l, column=2, value=fc).number_format = '#,##0.00'
        resumo.cell(row=l, column=3, value=fl).number_format = '#,##0.00'
        resumo.cell(row=l, column=4, value=round(50000 + i * 21000.5, 2))
    resumo['A12'] = 'TOTAL'
    resumo['A12'].font = NEG
    resumo['B12'] = '=SUM(B6:B10)'
    resumo['C12'] = '=SUM(C6:C10)'
    ch1 = BarChart()
    ch1.title = 'Contrato x Lucro por obra'
    ch1.add_data(Reference(resumo, min_col=4, min_row=5, max_row=10), titles_from_data=True)
    ch1.set_categories(Reference(resumo, min_col=1, min_row=6, max_row=10))
    resumo.add_chart(ch1, 'F4')
    ch2 = PieChart()
    ch2.title = 'Participação no lucro'
    ch2.add_data(Reference(resumo, min_col=4, min_row=5, max_row=10), titles_from_data=True)
    ch2.set_categories(Reference(resumo, min_col=1, min_row=6, max_row=10))
    resumo.add_chart(ch2, 'F22')

    wb.save(caminho)

# ---------------------------------------------------------------- ARQUIVO 4
def epdm_antigo(caminho):
    wb = openpyxl.Workbook()
    g = wb.active
    g.title = 'Gramoterra'
    c = wb.create_sheet('Coral Home')
    r = wb.create_sheet('Resumo')
    g['B2'] = 'EPDM GRAMOTERRA (ESPELHO ANTIGO)'
    g['B2'].font = TIT
    for i in range(4):
        g.cell(row=6 + i, column=3, value=f'Custo etapa {i + 1}')
        g.cell(row=6 + i, column=4, value=round(11000 + i * 2900.5, 2)).fill = AZUL
    g['B14'] = 96000
    g['B15'] = 10000
    g['B17'] = '=B14-SUM(D6:D9)-B14*0.12'
    c['B2'] = 'EPDM CORAL HOME (ESPELHO ANTIGO)'
    c['B2'].font = TIT
    c['C6'] = 88000
    c['C7'] = 42000
    c['C10'] = 36576.34
    c['C11'] = '=(B19+B20)*0.12'
    c['B19'] = 120000
    c['B20'] = 60000
    c['B22'] = 95000
    r['B2'] = 'RESUMO (DESATUALIZADO)'
    r['B2'].font = TIT
    for i in range(8):
        r.cell(row=6 + i, column=2, value=f'Linha de resumo {i + 1}')
        r.cell(row=6 + i, column=3, value=round(5000 + i * 1234.5, 2))
    r['C15'] = '=SUM(C6:C13)'
    wb.save(caminho)

# ------------------------------------------------- ARQUIVO 5 (stress de tamanho)
# Os originais do Excel sao bem mais gordos que a saida do openpyxl (theme, styles,
# calcChain, printerSettings). Este fixture existe so para medir tempo/memoria no
# tamanho REAL do maior arquivo do Thiago: ~334KB comprimido / ~2MB expandido.
def stress(caminho):
    wb = openpyxl.Workbook()
    palavras = ['lago', 'ornamental', 'piscina', 'praia', 'Maricá', 'Gramoterra', 'André',
                'Thiago', 'aporte', 'despesa', 'equipamento', 'EPDM', 'ozônio', 'filtro',
                'importação', 'contrato', 'parcela', 'pendente', 'recebido', 'orçamento']
    for s in range(6):
        ws = wb.create_sheet(f'Movimento {s + 1}') if s else wb.active
        if not s:
            ws.title = 'Movimento 1'
        cabecalho(ws, f'MOVIMENTO FINANCEIRO {s + 1}',
                  ['Data', 'Categoria', 'Descrição', 'Fornecedor', 'Forma', 'Valor',
                   'Pago por', 'Status', 'Rateio A', 'Rateio B', 'Acumulado', 'Mês'])
        for i in range(1200):
            l = 12 + i
            ws.cell(row=l, column=1, value=datetime.date(2026, 1, 1) + datetime.timedelta(days=i % 900)).number_format = 'DD/MM/YYYY'
            ws.cell(row=l, column=2, value=random.choice(palavras).capitalize())
            ws.cell(row=l, column=3, value=' '.join(random.choice(palavras) for _ in range(8)))
            ws.cell(row=l, column=4, value=random.choice(palavras).capitalize() + ' Ltda')
            ws.cell(row=l, column=5, value=random.choice(['PIX', 'TED', 'Boleto', 'Cartão']))
            ws.cell(row=l, column=6, value=round(random.uniform(100, 90000), 2)).number_format = '#,##0.00'
            ws.cell(row=l, column=7, value=random.choice(['André', 'Thiago', 'Empresa']))
            ws.cell(row=l, column=8, value=random.choice(['Pago', 'Pendente', 'EM REVISÃO']))
            ws.cell(row=l, column=9, value=f'=F{l}*0.5')
            ws.cell(row=l, column=10, value=f'=F{l}*0.5')
            ws.cell(row=l, column=11, value=f'=SUM($F$12:F{l})')
            ws.cell(row=l, column=12, value=f'=TEXT(A{l},"MMM/YY")')
        estilizar_faixa(ws, 12, 1211, 1, 8, AZUL)
        estilizar_faixa(ws, 12, 1211, 9, 12, VERDE)
    ch = BarChart()
    ch.title = 'Movimento'
    alvo = wb['Movimento 1']
    ch.add_data(Reference(alvo, min_col=6, min_row=12, max_row=60), titles_from_data=False)
    alvo.add_chart(ch, 'N4')
    wb.save(caminho)


def para_store(src, dst):
    with zipfile.ZipFile(src, 'r') as zin, zipfile.ZipFile(dst, 'w', compression=zipfile.ZIP_STORED) as zout:
        for info in zin.infolist():
            novo = zipfile.ZipInfo(info.filename, date_time=info.date_time)
            novo.compress_type = zipfile.ZIP_STORED
            novo.external_attr = info.external_attr
            zout.writestr(novo, zin.read(info.filename))

for nome, fn in [('lojao', lojao), ('horizon', horizon), ('controle-obras', controle_obras), ('stress-grande', stress),
                 ('epdm-antigo', epdm_antigo)]:
    src = os.path.join(DIR, nome + '.xlsx')
    fn(src)
    dst = os.path.join(DIR, nome + '.store.xlsx')
    para_store(src, dst)
    with zipfile.ZipFile(src) as z:
        n = len(z.infolist())
        expandido = sum(i.file_size for i in z.infolist())
        metodos = sorted(set(i.compress_type for i in z.infolist()))
    print(f'{nome}: {os.path.getsize(src)} bytes deflate / {os.path.getsize(dst)} bytes store / '
          f'{n} entradas / {expandido} bytes expandidos / metodos {metodos}')
