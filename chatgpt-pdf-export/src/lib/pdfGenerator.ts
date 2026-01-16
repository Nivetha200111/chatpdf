import jsPDF from 'jspdf';
import { Conversation, Message, CodeBlock } from '../types';

function stripHtml(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

export function sanitizeFilename(name: string): string {
    return name.replace(/[^a-z0-9_ \-]+/gi, '_').replace(/ /g, '_');
}

function renderCodeBlock(doc: jsPDF, block: CodeBlock, y: number, docWidth: number, margin: number): number {
    const codeFont = 'Courier';
    const codeFontSize = 9;
    const codeBgColor = '#1e1e1e';
    const codeTextColor = '#d4d4d4';
    const langTextColor = '#9cdcfe';
    const lineHeight = codeFontSize * 1.2 * 0.352778;

    doc.setFont(codeFont, 'normal');
    doc.setFontSize(codeFontSize);

    const lines = doc.splitTextToSize(block.code, docWidth - (margin * 2) - 10);
    const blockHeight = lines.length * lineHeight + 10;
    
    if (y + blockHeight > doc.internal.pageSize.height - margin) {
        doc.addPage();
        y = margin;
    }

    doc.setFillColor(codeBgColor);
    doc.rect(margin, y, docWidth - (margin * 2), blockHeight, 'F');
    
    doc.setTextColor(langTextColor);
    doc.text(block.language, margin + 5, y + 5);

    doc.setTextColor(codeTextColor);
    doc.text(lines, margin + 5, y + 10);
    
    return y + blockHeight + 5;
}

export async function generatePDF(conversation: Conversation): Promise<Blob> {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    const margin = 15;
    const docWidth = doc.internal.pageSize.getWidth();
    const docHeight = doc.internal.pageSize.getHeight();
    let y = margin;

    // Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    const titleLines = doc.splitTextToSize(conversation.title, docWidth - margin * 2);
    doc.text(titleLines, docWidth / 2, y, { align: 'center' });
    y += titleLines.length * 7 + 10;

    // Metadata
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`Exported on: ${conversation.exportedAt}`, margin, y);
    doc.text(`Source: ${conversation.url}`, margin, y + 4);
    y += 15;

    // Messages
    for (let i = 0; i < conversation.messages.length; i++) {
        const message = conversation.messages[i];
        
        if (y > docHeight - margin) {
            doc.addPage();
            y = margin;
        }

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(0);
        const role = message.role === 'user' ? 'You' : 'ChatGPT';
        doc.text(role, margin, y);
        y += 6;

        doc.setFont('Helvetica', 'normal');
        const contentLines = doc.splitTextToSize(stripHtml(message.content), docWidth - margin * 2);
        doc.text(contentLines, margin, y);
        y += contentLines.length * 4.5;
        
        for (const codeBlock of message.codeBlocks) {
            y = renderCodeBlock(doc, codeBlock, y, docWidth, margin);
        }

        y += 10;
    }
    
    // Page numbers
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, docWidth / 2, docHeight - 5, { align: 'center' });
    }

    return doc.output('blob');
}
