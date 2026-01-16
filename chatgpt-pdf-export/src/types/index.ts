export interface CodeBlock {
  language: string;
  code: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  codeBlocks: CodeBlock[];
}

export interface Conversation {
  title: string;
  messages: Message[];
  exportedAt: string;
  url: string;
}

export interface PDFOptions {
  theme: "light" | "dark";
  includeMetadata: boolean;
  fontSize: number;
}
