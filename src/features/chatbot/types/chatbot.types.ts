export type ChatRole = "user" | "assistant" | "system";

export type ToolStatus = "running" | "complete" | "incomplete";

export interface ChatSuggestion {
  id: string;
  label: string;
  prompt: string;
  category?: string;
}

export interface ChatbotProps {
  className?: string;
}

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  onReset?: () => void;
}

export interface ToolProps {
  name: string;
  args?: Record<string, unknown>;
  status?: ToolStatus;
}

// ─── API Contract Types ──────────────────────────────────────────────────────

export interface ChatApiRequest {
  sessionId?: string;
  message: string;
}

export interface DocumentSource {
  id?: string;
  content: string;
  metadata: {
    source: string;
    section?: string;
    chunkIndex?: number;
  };
  score?: number;
}

export interface PdfExport {
  title: string;
  content: string;
}

export interface ChatApiResponse {
  sessionId?: string;
  answer: string;
  sources?: DocumentSource[];
  agentUsed?: string;
  pdfExport?: PdfExport;
}
