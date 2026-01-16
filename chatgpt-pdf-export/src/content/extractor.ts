import { Conversation, Message, CodeBlock } from "../types";

const SELECTORS = {
    messageContainer: [
        '[data-message-author-role]',
        'article[data-scroll-anchor]',
        '[data-testid^="conversation-turn"]',
    ],
    title: [
        'h1',
        '[data-testid="conversation-title"]',
    ],
    codeBlock: ['pre code'],
};

function querySelectorWithFallback(selectors: string[]): Element | null {
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            return element;
        }
    }
    return null;
}

function extractTitle(): string {
    const titleElement = querySelectorWithFallback(SELECTORS.title);
    return titleElement?.textContent?.trim() || "Untitled Conversation";
}

function extractCodeBlocks(container: Element): CodeBlock[] {
    const codeBlocks: CodeBlock[] = [];
    container.querySelectorAll(SELECTORS.codeBlock.join(', ')).forEach(codeElement => {
        const parent = codeElement.parentElement;
        if (parent) {
            const langElement = parent.querySelector('div > span');
            const language = langElement?.textContent?.trim() || 'text';
            const code = (codeElement as HTMLElement).innerText || '';
            codeBlocks.push({ language, code });
        }
    });
    return codeBlocks;
}

export function extractConversation(): Conversation {
    const title = extractTitle();
    const messages: Message[] = [];

    document.querySelectorAll(SELECTORS.messageContainer.join(', ')).forEach(container => {
        const role = (container as HTMLElement).dataset.messageAuthorRole as "user" | "assistant";
        if (role) {
            const contentElement = container.querySelector('.markdown');
            let content = contentElement ? (contentElement as HTMLElement).innerText : '';
            
            const codeBlocks = extractCodeBlocks(container);
            
            // Remove code block content from the main content to avoid duplication
            codeBlocks.forEach(block => {
                content = content.replace(block.code, '');
            });

            messages.push({
                role,
                content: content.trim(),
                codeBlocks,
            });
        }
    });

    return {
        title,
        messages,
        exportedAt: new Date().toLocaleString(),
        url: window.location.href,
    };
}
