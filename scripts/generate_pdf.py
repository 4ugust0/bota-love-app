#!/usr/bin/env python3
"""
Script para gerar PDF de Validação Técnica do Bota Love App
Utiliza markdown2pdf para converter documentação
"""

import os
import sys
from datetime import datetime

# Markdown para HTML simples (sem dependências externas)
def markdown_to_html(md_text):
    """Converte markdown básico para HTML"""
    html = md_text
    
    # Headers
    html = html.replace('# ', '<h1 style="font-size: 28pt; margin-top: 30px; margin-bottom: 10px; font-weight: bold; color: #1F130C;">')
    html = html.replace('\n</h1>', '</h1>\n')
    
    html = html.replace('## ', '<h2 style="font-size: 20pt; margin-top: 20px; margin-bottom: 8px; font-weight: bold; color: #502914;">')
    html = html.replace('\n</h2>', '</h2>\n')
    
    html = html.replace('### ', '<h3 style="font-size: 16pt; margin-top: 15px; margin-bottom: 6px; font-weight: bold; color: #663C23;">')
    html = html.replace('\n</h3>', '</h3>\n')
    
    # Bold
    html = html.replace('**', '<b>')
    
    # Links
    html = html.replace('[', '<a href="')
    html = html.replace(']', '"></a>')
    
    # Listas
    html = html.replace('- ', '<li>')
    html = html.replace('✅ ', '<li>✅ ')
    html = html.replace('❌ ', '<li>❌ ')
    
    # Código
    html = html.replace('```', '<pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;"><code>')
    
    # Quebras de linha
    html = html.replace('\n\n', '</p><p style="margin: 10px 0;">')
    
    return html

# Tentar usar reportlab, caso contrário usar markdown2pdf
try:
    from reportlab.lib.pagesizes import A4, letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch, cm
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
    from reportlab.lib import colors
    from reportlab.pdfgen import canvas
    from datetime import datetime
    import subprocess
    
    print("✓ reportlab encontrado")
    USE_REPORTLAB = True
except ImportError:
    print("⚠ reportlab não disponível, tentando pandoc...")
    USE_REPORTLAB = False

def create_pdf_with_reportlab(markdown_file, pdf_file):
    """Cria PDF usando reportlab"""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER, TA_LEFT
    from datetime import datetime
    
    # Cores da marca
    PRIMARY_COLOR = colors.HexColor('#F9A825')
    SECONDARY_COLOR = colors.HexColor('#502914')
    TEXT_COLOR = colors.HexColor('#1F130C')
    LIGHT_BG = colors.HexColor('#FFF9E6')
    
    # Criar documento
    doc = SimpleDocTemplate(
        pdf_file,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
        title='Documentação Técnica - Bota Love App',
        author='Bota Love Team',
        subject='Validação Técnica do Aplicativo Mobile'
    )
    
    # Estilos
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=SECONDARY_COLOR,
        spaceAfter=12,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=SECONDARY_COLOR,
        spaceAfter=10,
        spaceBefore=10,
        fontName='Helvetica-Bold'
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=11,
        textColor=TEXT_COLOR,
        alignment=TA_JUSTIFY,
        spaceAfter=10
    )
    
    # Ler markdown
    with open(markdown_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Elementos do documento
    elements = []
    
    # Capa
    elements.append(Spacer(1, 2*cm))
    elements.append(Paragraph(
        '<b>DOCUMENTAÇÃO TÉCNICA</b>',
        title_style
    ))
    elements.append(Spacer(1, 0.5*cm))
    elements.append(Paragraph(
        '<b>Validação do Aplicativo Mobile Bota Love</b>',
        heading_style
    ))
    elements.append(Spacer(1, 1*cm))
    elements.append(Paragraph(
        f'<b>Data:</b> {datetime.now().strftime("%d de %B de %Y")}<br/>'
        '<b>Versão:</b> 1.0.0<br/>'
        '<b>Status:</b> Produção<br/>'
        '<b>Classificação:</b> Documentação Técnica - Validação Contratual',
        body_style
    ))
    elements.append(PageBreak())
    
    # Índice
    elements.append(Paragraph('<b>ÍNDICE</b>', title_style))
    elements.append(Spacer(1, 0.5*cm))
    
    index_items = [
        '1. Resumo Executivo',
        '2. Lista Completa de Funcionalidades',
        '3. Arquitetura do Sistema',
        '4. Descrição Detalhada das Funcionalidades',
        '5. Banco de Dados Firebase',
        '6. Cloud Functions - Endpoints',
        '7. Fluxos e Telas do Aplicativo',
        '8. Componentes e Ativos Técnicos',
        '9. Stack Tecnológico',
        '10. Segurança e Regras Firestore',
    ]
    
    for item in index_items:
        elements.append(Paragraph(f'• {item}', body_style))
    
    elements.append(PageBreak())
    
    # Processar conteúdo markdown
    lines = content.split('\n')
    current_section = ''
    
    for line in lines:
        if line.startswith('# '):
            if current_section:
                elements.append(PageBreak())
            current_section = line[2:].strip()
            elements.append(Paragraph(current_section, title_style))
            elements.append(Spacer(1, 0.3*cm))
        
        elif line.startswith('## '):
            elements.append(Paragraph(line[3:].strip(), heading_style))
            elements.append(Spacer(1, 0.2*cm))
        
        elif line.startswith('### '):
            elements.append(Paragraph(
                f'<b>{line[4:].strip()}</b>',
                ParagraphStyle(
                    'SubHeading',
                    parent=styles['Normal'],
                    fontSize=12,
                    textColor=SECONDARY_COLOR,
                    spaceAfter=6,
                    fontName='Helvetica-Bold'
                )
            ))
        
        elif line.startswith('- '):
            elements.append(Paragraph(f'• {line[2:].strip()}', body_style))
        
        elif line.startswith('✅ '):
            elements.append(Paragraph(f'✅ {line[3:].strip()}', body_style))
        
        elif line.startswith('❌ '):
            elements.append(Paragraph(f'❌ {line[3:].strip()}', body_style))
        
        elif line.startswith('```'):
            # Ignora blocos de código
            continue
        
        elif line.strip() and not line.startswith('```'):
            if line.startswith('|'):
                # Ignora tabelas por enquanto
                continue
            elif line.startswith('> '):
                elements.append(Paragraph(
                    f'<i>{line[2:].strip()}</i>',
                    body_style
                ))
            elif line.strip():
                elements.append(Paragraph(line.strip(), body_style))
    
    # Footer automático
    def add_footer(canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.grey)
        canvas.drawString(2*cm, 1*cm, f"Bota Love App - Documentação Técnica v1.0.0 - {datetime.now().strftime('%d/%m/%Y')}")
        canvas.drawRightString(A4[0] - 2*cm, 1*cm, f"Página {doc.page}")
        canvas.restoreState()
    
    # Build PDF
    doc.build(elements, onFirstPage=add_footer, onLaterPages=add_footer)
    print(f"✓ PDF gerado: {pdf_file}")

def create_pdf_with_pandoc(markdown_file, pdf_file):
    """Cria PDF usando pandoc (alternativa)"""
    try:
        cmd = [
            'pandoc',
            markdown_file,
            '-o', pdf_file,
            '--pdf-engine=xelatex',
            '-V', 'geometry:margin=2cm',
            '-V', 'fontsize=11pt',
            '--toc',
            '--toc-depth=2'
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✓ PDF gerado com pandoc: {pdf_file}")
            return True
        else:
            print(f"✗ Erro com pandoc: {result.stderr}")
            return False
    
    except FileNotFoundError:
        print("⚠ pandoc não encontrado")
        return False

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    markdown_file = os.path.join(script_dir, 'docs', 'VALIDACAO_TECNICA.md')
    pdf_file = os.path.join(script_dir, 'docs', 'DOCUMENTACAO_VALIDACAO_BOTA_LOVE_APP.pdf')
    
    if not os.path.exists(markdown_file):
        print(f"✗ Arquivo não encontrado: {markdown_file}")
        sys.exit(1)
    
    print(f"📄 Processando: {markdown_file}")
    print(f"📕 Gerando PDF: {pdf_file}")
    print()
    
    # Tentar reportlab primeiro
    if USE_REPORTLAB:
        try:
            create_pdf_with_reportlab(markdown_file, pdf_file)
            return
        except Exception as e:
            print(f"⚠ Erro com reportlab: {e}")
            print("Tentando alternativa com pandoc...")
    
    # Alternativa: pandoc
    if create_pdf_with_pandoc(markdown_file, pdf_file):
        return
    
    # Última alternativa: simple text to HTML to PDF
    print("ℹ Criando PDF simples...")
    with open(markdown_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Salvar como HTML para abrir em navegador
    html_file = pdf_file.replace('.pdf', '.html')
    html_content = f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Documentação Técnica - Bota Love App</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #1F130C;
                margin: 40px;
                background: #FFF9E6;
            }}
            h1 {{
                color: #502914;
                border-bottom: 3px solid #F9A825;
                padding-bottom: 10px;
            }}
            h2 {{
                color: #663C23;
                margin-top: 30px;
            }}
            h3 {{
                color: #7A5841;
            }}
            code {{
                background: #f5f5f5;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
            }}
            pre {{
                background: #f5f5f5;
                padding: 15px;
                border-radius: 5px;
                overflow-x: auto;
            }}
            table {{
                border-collapse: collapse;
                width: 100%;
                margin: 20px 0;
            }}
            th, td {{
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }}
            th {{
                background-color: #F9A825;
                color: white;
            }}
            .footer {{
                margin-top: 50px;
                padding-top: 20px;
                border-top: 2px solid #F9A825;
                text-align: center;
                font-size: 12px;
                color: #666;
            }}
        </style>
    </head>
    <body>
        {markdown_to_html(content)}
        <div class="footer">
            <p>Bota Love App - Documentação Técnica de Validação v1.0.0</p>
            <p>Data: {datetime.now().strftime("%d de %B de %Y")}</p>
            <p>Status: Produção</p>
        </div>
    </body>
    </html>
    """
    
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✓ Documento HTML gerado: {html_file}")
    print(f"  Abra em um navegador e use Ctrl+P para salvar como PDF")

if __name__ == '__main__':
    main()
