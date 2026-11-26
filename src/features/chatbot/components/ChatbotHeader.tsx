import React from "react";
import { Bot, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { CHAT_CONFIG } from "../constants/chatbot.constants";
import type { HeaderProps } from "../types/chatbot.types";

export const ChatbotHeader: React.FC<HeaderProps> = ({
  title = CHAT_CONFIG.title,
  subtitle = CHAT_CONFIG.subtitle,
  onReset,
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-card/80 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center size-10 rounded-xl bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-sm">
          <Bot className="size-5" />
          <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground tracking-tight">
              {title}
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="size-3" />
              IA active
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate max-w-xs sm:max-w-md">
            {subtitle}
          </p>
        </div>
      </div>

      {onReset && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="gap-2 text-xs font-normal hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
          title="Réinitialiser la conversation"
        >
          <RotateCcw className="size-3.5" />
          <span className="hidden sm:inline">Effacer</span>
        </Button>
      )}
    </header>
  );
};
