import React, { useRef } from "react";
import { ComposerPrimitive, AuiIf } from "@assistant-ui/react";
import { ArrowUp, Square } from "lucide-react";
import { CHAT_CONFIG } from "../constants/chatbot.constants";

export const ComposerInput: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-card/95 border-t border-border/60 backdrop-blur-md shrink-0">
      <ComposerPrimitive.Root
        ref={formRef}
        className="relative flex items-end gap-2 p-1.5 sm:p-2 rounded-xl border border-border/80 bg-background shadow-xs focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all"
      >
        <ComposerPrimitive.Input
          rows={1}
          autoFocus
          placeholder={CHAT_CONFIG.placeholder}
          className="flex-1 max-h-36 min-h-[40px] p-2 bg-transparent text-sm text-foreground outline-none resize-none placeholder:text-muted-foreground/70 custom-scrollbar leading-relaxed"
          onKeyDown={handleKeyDown}
        />

        <div className="flex items-center gap-1 shrink-0 pb-1 pr-1">
          {/* Send button when not running */}
          <AuiIf condition={(s) => !s.thread.isRunning}>
            <ComposerPrimitive.Send asChild>
              <button
                type="submit"
                className="flex items-center justify-center size-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-xs active:scale-95"
                title={CHAT_CONFIG.sendText}
              >
                <ArrowUp className="size-4 stroke-[2.5]" />
              </button>
            </ComposerPrimitive.Send>
          </AuiIf>

          {/* Stop / Cancel button when running */}
          <AuiIf condition={(s) => s.thread.isRunning}>
            <ComposerPrimitive.Cancel asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive text-white hover:bg-destructive/90 transition-all cursor-pointer shadow-xs active:scale-95 text-xs font-medium"
                title={CHAT_CONFIG.stopText}
              >
                <Square className="size-3 fill-current" />
                <span>{CHAT_CONFIG.stopText}</span>
              </button>
            </ComposerPrimitive.Cancel>
          </AuiIf>
        </div>
      </ComposerPrimitive.Root>
      <p className="mt-2 text-[11px] text-center text-muted-foreground/60 hidden sm:block">
        Entrée pour envoyer • Maj + Entrée pour un saut de ligne
      </p>
    </div>
  );
};
