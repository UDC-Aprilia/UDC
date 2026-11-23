#!/usr/bin/env python3
"""Rigenera la pagina privacy dal PDF ufficiale in documenti/."""
from pathlib import Path
import fitz, html, re
ROOT=Path(__file__).resolve().parents[1]
PDF=ROOT/'documenti/Informativa-Privacy-UDC-Aprilia-2026.pdf'
PAGE=ROOT/'privacy.html'
def main():
    doc=fitz.open(PDF)
    lines=[]
    for page in doc:
        for line in page.get_text(sort=True).splitlines():
            line=line.strip()
            if not line or line.startswith('UDC APRILIA |') or 'UDC APRILIA • Informativa' in line:continue
            lines.append(line)
    doc.close()
    text=' '.join(lines)
    text=re.sub(r'(?<!\w)(\d{1,2}\. [A-ZÀ-Ü])',r'\n\1',text)
    sections=[]
    for piece in text.split('\n'):
        piece=piece.strip()
        if not piece:continue
        if re.match(r'^\d{1,2}\. ',piece):
            heading,_,body=piece.partition('  ')
            m=re.match(r'^(\d{1,2}\. [^.!?]+?)(?= (?:Il |La |Per |Durante |I |Secondo |L\'|Le |Gli |Ai |Il sito |La presente |Il titolare |La semplice |L\'utilizzo |La corrispondenza |Questa |Non |Secondo ))',piece)
            if m: heading=m.group(1);body=piece[len(heading):].strip()
            else:heading=piece[:90];body=piece[90:]
            sections.append('<h2>'+html.escape(heading)+'</h2><p>'+html.escape(body)+'</p>')
        else: sections.append('<p>'+html.escape(piece)+'</p>')
    original=PAGE.read_text(encoding='utf-8')
    start=original.index('<main id="contenuto-statico">')
    end=original.index('</main>',start)+len('</main>')
    body='<main id="contenuto-statico"><h1>Informativa sul trattamento dei dati personali</h1><p>Revisione: 23 novembre 2026 · <a href="documenti/Informativa-Privacy-UDC-Aprilia-2026.pdf" download>Scarica l’informativa completa in PDF</a></p>'+''.join(sections)+'</main>'
    PAGE.write_text(original[:start]+body+original[end:],encoding='utf-8')
if __name__=='__main__':main()
