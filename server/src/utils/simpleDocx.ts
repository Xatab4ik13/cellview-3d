import PizZip from 'pizzip';

export interface DocxParagraph {
  text: string;
  bold?: boolean;
  size?: number; // half-points, default 22 (11pt)
  align?: 'left' | 'center' | 'right' | 'both';
  spaceAfter?: number; // twips
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function paragraphXml(p: DocxParagraph): string {
  const size = p.size ?? 22;
  const align = p.align ?? 'both';
  const after = p.spaceAfter ?? 120;
  const lines = String(p.text ?? '').split('\n');
  const runs = lines
    .map((line, i) => {
      const br = i > 0 ? '<w:br/>' : '';
      return `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="${size}"/>${
        p.bold ? '<w:b/>' : ''
      }</w:rPr>${br}<w:t xml:space="preserve">${esc(line)}</w:t></w:r>`;
    })
    .join('');
  return `<w:p><w:pPr><w:jc w:val="${align}"/><w:spacing w:after="${after}"/></w:pPr>${runs}</w:p>`;
}

/** Собирает простой .docx из списка абзацев (без внешних зависимостей). */
export function buildDocx(paragraphs: DocxParagraph[]): Buffer {
  const zip = new PizZip();

  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`
  );

  zip.folder('_rels')!.file(
    '.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`
  );

  const body = paragraphs.map(paragraphXml).join('');
  zip.folder('word')!.file(
    'document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="850" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`
  );

  return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }) as Buffer;
}
