#!/usr/bin/env python3
"""
Gerador de PDF para Documentação Técnica do Bota Love App
Cria um documento profissional com estrutura completa
"""

import os
import sys
from datetime import datetime

def generate_pdf():
    """Gera PDF da documentação técnica"""
    
    # Caminhos
    script_dir = os.path.dirname(os.path.abspath(__file__))
    docs_dir = os.path.join(os.path.dirname(script_dir), 'docs')
    markdown_file = os.path.join(docs_dir, 'VALIDACAO_TECNICA.md')
    html_file = os.path.join(docs_dir, 'DOCUMENTACAO_VALIDACAO_BOTA_LOVE_APP.html')
    
    if not os.path.exists(markdown_file):
        print(f"✗ Arquivo não encontrado: {markdown_file}")
        return False
    
    print("📄 Convertendo Markdown para HTML...")
    
    # Ler arquivo markdown
    with open(markdown_file, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Converter markdown para HTML
    html_content = markdown_to_html(md_content)
    
    # Salvar HTML
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✓ HTML gerado: {html_file}")
    print()
    print("Para converter para PDF, abra o arquivo HTML em um navegador e use:")
    print("  • Google Chrome: Ctrl+P > Salvar como PDF")
    print("  • Firefox: Ctrl+P > Salvar como PDF")
    print("  • Safari: Ctrl+P > Salvar como PDF")
    print()
    
    return True

def markdown_to_html(md_content):
    """Converte conteúdo markdown para HTML formatado"""
    
    lines = md_content.split('\n')
    html_lines = []
    
    # Cabeçalho HTML
    html_lines.append('''<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentação Técnica - Bota Love App</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        @page {
            size: A4;
            margin: 2cm;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.8;
            color: #1F130C;
            background: #FFFFFF;
            padding: 40px;
            max-width: 900px;
            margin: 0 auto;
        }
        
        /* Capa */
        .cover {
            page-break-after: always;
            text-align: center;
            padding: 100px 0;
            border-bottom: 3px solid #F9A825;
            margin-bottom: 40px;
        }
        
        .cover h1 {
            font-size: 36px;
            color: #502914;
            margin: 20px 0;
            font-weight: 700;
        }
        
        .cover .subtitle {
            font-size: 20px;
            color: #663C23;
            margin: 20px 0;
            font-weight: 500;
        }
        
        .cover .meta {
            font-size: 12px;
            color: #7A5841;
            margin-top: 60px;
            line-height: 1.8;
        }
        
        /* Headers */
        h1 {
            font-size: 28px;
            color: #502914;
            margin: 40px 0 20px 0;
            font-weight: 700;
            border-bottom: 3px solid #F9A825;
            padding-bottom: 10px;
            page-break-after: avoid;
        }
        
        h2 {
            font-size: 22px;
            color: #663C23;
            margin: 30px 0 15px 0;
            font-weight: 700;
            page-break-after: avoid;
        }
        
        h3 {
            font-size: 16px;
            color: #7A5841;
            margin: 20px 0 10px 0;
            font-weight: 600;
            page-break-after: avoid;
        }
        
        h4 {
            font-size: 14px;
            color: #502914;
            margin: 15px 0 8px 0;
            font-weight: 600;
            page-break-after: avoid;
        }
        
        /* Parágrafo */
        p {
            margin: 12px 0;
            text-align: justify;
            hyphens: auto;
        }
        
        /* Listas */
        ul, ol {
            margin: 15px 0 15px 30px;
        }
        
        ul li, ol li {
            margin: 8px 0;
        }
        
        ul li strong, ol li strong {
            color: #502914;
        }
        
        /* Links */
        a {
            color: #F9A825;
            text-decoration: none;
            border-bottom: 1px dotted #F9A825;
        }
        
        a:hover {
            color: #F57C00;
        }
        
        /* Código */
        code {
            background: #FFF9E6;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 12px;
            color: #502914;
        }
        
        pre {
            background: #f5f5f5;
            border-left: 4px solid #F9A825;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 15px 0;
            font-size: 11px;
            line-height: 1.4;
            page-break-inside: avoid;
        }
        
        pre code {
            background: none;
            padding: 0;
            color: #1F130C;
        }
        
        /* Blockquote */
        blockquote {
            border-left: 4px solid #F9A825;
            margin: 15px 0;
            padding-left: 15px;
            color: #663C23;
            font-style: italic;
        }
        
        /* Tabelas */
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
            page-break-inside: avoid;
        }
        
        th {
            background: #F9A825;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 700;
            border: 1px solid #f0f0f0;
        }
        
        td {
            padding: 10px 12px;
            border: 1px solid #e0e0e0;
        }
        
        tr:nth-child(even) {
            background: #FFF9E6;
        }
        
        /* Linha horizontal */
        hr {
            border: none;
            height: 2px;
            background: #F9A825;
            margin: 30px 0;
        }
        
        /* Índice */
        .toc {
            page-break-after: always;
            background: #FFF9E6;
            padding: 20px;
            border-radius: 5px;
        }
        
        .toc h2 {
            border: none;
            margin-bottom: 20px;
        }
        
        .toc ul {
            list-style: none;
            margin: 0;
        }
        
        .toc li {
            margin: 8px 0;
            color: #502914;
        }
        
        /* Boxes especiais */
        .note {
            background: #E3F2FD;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 15px 0;
            border-radius: 3px;
        }
        
        .warning {
            background: #FFF3E0;
            border-left: 4px solid #FF9800;
            padding: 15px;
            margin: 15px 0;
            border-radius: 3px;
        }
        
        .success {
            background: #E8F5E9;
            border-left: 4px solid #4CAF50;
            padding: 15px;
            margin: 15px 0;
            border-radius: 3px;
        }
        
        /* Footer */
        .footer {
            margin-top: 80px;
            padding-top: 20px;
            border-top: 2px solid #F9A825;
            text-align: center;
            font-size: 11px;
            color: #999;
            page-break-before: always;
        }
        
        .footer p {
            margin: 5px 0;
        }
        
        /* Print */
        @media print {
            body {
                padding: 0;
            }
            
            a {
                color: #F9A825;
            }
            
            h1, h2, h3, h4 {
                page-break-after: avoid;
            }
            
            table, ul, ol, pre {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
''')
    
    # Capa
    html_lines.append('''
    <div class="cover">
        <h1>DOCUMENTAÇÃO TÉCNICA</h1>
        <div class="subtitle">Validação do Aplicativo Mobile Bota Love</div>
        <div class="meta">
            <p><strong>Versão:</strong> 1.0.0</p>
            <p><strong>Data:</strong> ''' + datetime.now().strftime("%d de %B de %Y").replace("January", "Janeiro").replace("February", "Fevereiro").replace("March", "Março").replace("April", "Abril").replace("May", "Maio").replace("June", "Junho").replace("July", "Julho").replace("August", "Agosto").replace("September", "Setembro").replace("October", "Outubro").replace("November", "Novembro").replace("December", "Dezembro") + '''</p>
            <p><strong>Status:</strong> Produção</p>
            <p><strong>Classificação:</strong> Documentação Técnica - Validação Contratual</p>
        </div>
    </div>
    ''')
    
    # Processar linhas de markdown
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Headers
        if line.startswith('# '):
            html_lines.append(f'<h1>{escape_html(line[2:].strip())}</h1>')
        
        elif line.startswith('## '):
            html_lines.append(f'<h2>{escape_html(line[3:].strip())}</h2>')
        
        elif line.startswith('### '):
            html_lines.append(f'<h3>{escape_html(line[4:].strip())}</h3>')
        
        elif line.startswith('#### '):
            html_lines.append(f'<h4>{escape_html(line[5:].strip())}</h4>')
        
        # Linhas horizontais
        elif line.strip() == '---':
            html_lines.append('<hr>')
        
        # Listas
        elif line.startswith('- '):
            if not html_lines[-1].startswith('<ul>'):
                html_lines.append('<ul>')
            html_lines.append(f'<li>{convert_inline_markdown(line[2:].strip())}</li>')
            if i == len(lines) - 1 or not lines[i+1].startswith('- '):
                html_lines.append('</ul>')
        
        elif line.startswith('✅ ') or line.startswith('❌ '):
            if not html_lines[-1].startswith('<ul>'):
                html_lines.append('<ul>')
            html_lines.append(f'<li>{escape_html(line.strip())}</li>')
            if i == len(lines) - 1 or (not lines[i+1].startswith('✅ ') and not lines[i+1].startswith('❌ ')):
                html_lines.append('</ul>')
        
        # Código multi-linha
        elif line.startswith('```'):
            html_lines.append('<pre><code>')
            i += 1
            while i < len(lines) and not lines[i].startswith('```'):
                html_lines.append(escape_html(lines[i]))
                i += 1
            html_lines.append('</code></pre>')
        
        # Tabelas (simplificado)
        elif line.startswith('|'):
            # Pular tabelas complexas por enquanto
            pass
        
        # Blockquotes
        elif line.startswith('> '):
            html_lines.append(f'<blockquote>{convert_inline_markdown(line[2:].strip())}</blockquote>')
        
        # Parágrafos normais
        elif line.strip():
            html_lines.append(f'<p>{convert_inline_markdown(line.strip())}</p>')
        
        i += 1
    
    # Footer
    html_lines.append('''
    <div class="footer">
        <p><strong>Bota Love App</strong> - Documentação Técnica de Validação</p>
        <p>Versão 1.0.0 | Status: Produção</p>
        <p>Data: ''' + datetime.now().strftime("%d/%m/%Y") + '''</p>
    </div>
    
</body>
</html>
    ''')
    
    return '\n'.join(html_lines)

def escape_html(text):
    """Escapa caracteres HTML"""
    return (text
        .replace('&', '&amp;')
        .replace('<', '&lt;')
        .replace('>', '&gt;')
        .replace('"', '&quot;')
        .replace("'", '&#39;'))

def convert_inline_markdown(text):
    """Converte markdown inline para HTML"""
    # Bold
    text = text.replace('**', '<strong>', 1)
    text = text.replace('**', '</strong>', 1)
    
    # Italic
    text = text.replace('*', '<em>', 1)
    text = text.replace('*', '</em>', 1)
    
    # Code inline
    import re
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    
    # Links
    text = re.sub(r'\[([^\]]+)\]\(([^\)]+)\)', r'<a href="\2">\1</a>', text)
    
    return text

if __name__ == '__main__':
    success = generate_pdf()
    sys.exit(0 if success else 1)
