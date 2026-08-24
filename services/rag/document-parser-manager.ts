import { DocumentParserReport, DocumentParserConfig } from '@/packages/types/src';

export class DocumentParserManagerService {
  public getParserReport(workspaceId: string = 'ws_enterprise_01'): DocumentParserReport {
    const parsers: DocumentParserConfig[] = [
      {
        id: 'parser_pdf_01',
        fileType: 'PDF',
        parserName: 'PDF Structural Vectorized Layout Parser',
        status: 'ACTIVE',
        isValidated: true,
        supportedFormats: ['application/pdf', '.pdf'],
        extractionCapabilities: ['Page Segmentation', 'Header / Footer Filtering', 'Table Outline Extraction', 'OCR Fallback Plan']
      },
      {
        id: 'parser_docx_01',
        fileType: 'DOCX',
        parserName: 'DOCX OpenXML AST Section Parser',
        status: 'ACTIVE',
        isValidated: true,
        supportedFormats: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.docx'],
        extractionCapabilities: ['Heading Hierarchy Preservations', 'Inline List Extraction', 'Hyperlink Mapping', 'Author Metadata']
      },
      {
        id: 'parser_md_01',
        fileType: 'MD',
        parserName: 'Markdown CommonMark AST Block Parser',
        status: 'ACTIVE',
        isValidated: true,
        supportedFormats: ['text/markdown', '.md', '.markdown'],
        extractionCapabilities: ['Header Depth Mapping', 'Code Block Isolation', 'Yaml Frontmatter Extraction', 'Link Anchor Mapping']
      },
      {
        id: 'parser_txt_01',
        fileType: 'TXT',
        parserName: 'PlainText Sentence & Paragraph Segmenter',
        status: 'ACTIVE',
        isValidated: true,
        supportedFormats: ['text/plain', '.txt', '.log'],
        extractionCapabilities: ['Paragraph Boundaries', 'Regex Line Pattern Matching', 'Charset Normalization']
      }
    ];

    return {
      id: `dpr_${Date.now()}`,
      workspaceId,
      parsers,
      activeParsersCount: parsers.filter(p => p.status === 'ACTIVE').length,
      validationStatus: 'ALL_PARSERS_VALIDATED',
      generatedAt: new Date().toISOString()
    };
  }
}

export const documentParserManagerService = new DocumentParserManagerService();
