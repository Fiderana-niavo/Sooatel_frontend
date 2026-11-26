import React from "react";
import {
  MessagePrimitive,
  ActionBarPrimitive,
  useAuiState,
} from "@assistant-ui/react";
import { Bot, Copy, RotateCcw, Check, FileDown } from "lucide-react";
import { MarkdownContent } from "./MarkdownContent";
import { LoadingIndicator } from "./LoadingIndicator";
import { ToolCallIndicator } from "./ToolCallIndicator";
import { ErrorMessage } from "./ErrorMessage";
import { exportChatPdf } from "../utils/chatPdf";
import { PdfDownloadCard } from "./PdfDownloadCard";
import type { PdfExport } from "../types/chatbot.types";

const usePdfExport = (): PdfExport | undefined => {
  const custom = useAuiState((state) => state.message.metadata.custom);
  const running = useAuiState(
    (state) => state.message.status?.type === "running",
  );
  if (running) return undefined;
  return custom.pdfExport as PdfExport | undefined;
};

export const AssistantMessage: React.FC = () => {
  const pdfExport = usePdfExport();

  return (
    <MessagePrimitive.Root className="group relative flex items-start gap-3 my-4 pr-6 sm:pr-14 animate-in fade-in">
      <div className="flex items-center justify-center size-8 rounded-xl bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-xs shrink-0 mt-1">
        <Bot className="size-4" />
      </div>

      <div className="flex flex-col items-start max-w-full overflow-hidden">
        <div className="rounded-2xl rounded-tl-xs px-4 py-3 bg-card border border-border/60 text-foreground text-sm shadow-xs break-words w-full">
          <MessagePrimitive.Parts
            components={{
              Text: MarkdownContent,
              Empty: () => <LoadingIndicator />,
              tools: {
                Fallback: (tool) => (
                  <ToolCallIndicator
                    toolName={tool.toolName}
                    isComplete={!tool.isPreliminary}
                  />
                ),
              },
            }}
          />

          {pdfExport ? (
            <PdfDownloadCard
              title={pdfExport.title}
              onDownload={() =>
                void exportChatPdf(pdfExport.content, pdfExport.title)
              }
            />
          ) : null}

          <MessagePrimitive.Error>
            <ErrorMessage />
          </MessagePrimitive.Error>
        </div>

        <ActionBarPrimitive.Root className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground">
          <ActionBarPrimitive.Copy asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-muted/80 hover:text-foreground transition-colors cursor-pointer"
              title="Copier la réponse"
            >
              <MessagePrimitive.If copied>
                <Check className="size-3 text-emerald-500" />
                <span className="text-emerald-500">Copié</span>
              </MessagePrimitive.If>
              <MessagePrimitive.If copied={false}>
                <Copy className="size-3" />
                <span>Copier</span>
              </MessagePrimitive.If>
            </button>
          </ActionBarPrimitive.Copy>

          <ActionBarPrimitive.ExportMarkdown
            asChild
            onExport={(content: string) => exportChatPdf(content)}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-muted/80 hover:text-foreground transition-colors cursor-pointer"
              title="Exporter la réponse en PDF"
            >
              <FileDown className="size-3" />
              <span>Exporter en PDF</span>
            </button>
          </ActionBarPrimitive.ExportMarkdown>

          <ActionBarPrimitive.Reload asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-muted/80 hover:text-foreground transition-colors cursor-pointer"
              title="Régénérer"
            >
              <RotateCcw className="size-3" />
              <span>Régénérer</span>
            </button>
          </ActionBarPrimitive.Reload>
        </ActionBarPrimitive.Root>
      </div>
    </MessagePrimitive.Root>
  );
};
