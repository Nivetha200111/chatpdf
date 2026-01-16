import { extractConversation } from './extractor';
import { generatePDF, sanitizeFilename } from '../lib/pdfGenerator';

let downloadButton: HTMLButtonElement | null = null;

function createDownloadButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.id = 'pdf-export-btn';
    button.className = 'pdf-export-button';
    button.title = 'Download conversation as PDF';
    
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
    </svg>`;
    
    button.innerHTML = `${svgIcon} <span>PDF</span>`;
    button.addEventListener('click', handleDownload);
    return button;
}

async function handleDownload(): Promise<void> {
    if (!downloadButton) return;

    downloadButton.disabled = true;
    downloadButton.innerHTML = '<div class="spinner"></div> <span>Generating...</span>';

    try {
        const conversation = extractConversation();
        if (conversation.messages.length === 0) {
            throw new Error("Empty conversation.");
        }

        const pdfBlob = await generatePDF(conversation);
        const fileName = sanitizeFilename(conversation.title) + '.pdf';

        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        downloadButton.innerHTML = '<span>✓ Downloaded</span>';

    } catch (error) {
        console.error("PDF generation failed:", error);
        downloadButton.innerHTML = '<span>Error</span>';
    } finally {
        setTimeout(() => resetButton(downloadButton!), 2000);
    }
}

function resetButton(button: HTMLButtonElement): void {
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
    </svg>`;
    button.disabled = false;
    button.innerHTML = `${svgIcon} <span>PDF</span>`;
}

export function injectDownloadButton(): void {
    const observer = new MutationObserver(() => {
        if (document.getElementById('pdf-export-btn')) {
            return;
        }
        const targetSelector = 'form > div > div';
        const targetArea = document.querySelector(targetSelector);
        if (targetArea) {
            downloadButton = createDownloadButton();
            
            const wrapper = document.createElement('div');
            wrapper.style.position = 'absolute';
            wrapper.style.right = '100%';
            wrapper.style.top = '0';
            wrapper.style.marginRight = '8px';

            wrapper.appendChild(downloadButton);
            (targetArea as HTMLElement).style.position = 'relative';
            targetArea.appendChild(wrapper);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}
