import React from "react";
import { MessagePrimitive, ActionBarPrimitive } from "@assistant-ui/react";
import { Bot, Copy, RotateCcw } from "lucide-react";
import { MarkdownContent } from "./MarkdownContent";
import { LoadingIndicator } from "./LoadingIndicator";
import { ToolCallIndicator } from "./ToolCallIndicator";
import { ErrorMessage } from "./ErrorMessage";

export const AssistantMessage: React.FC = () => {
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
              <Copy className="size-3" />
              <span>Copier</span>
            </button>
          </ActionBarPrimitive.Copy>

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
