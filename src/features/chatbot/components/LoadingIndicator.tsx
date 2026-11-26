import React from "react";
import { Sparkles } from "lucide-react";
import { useMessageError } from "@assistant-ui/core/react";
import { CHAT_CONFIG } from "../constants/chatbot.constants";

interface LoadingProps {
  label?: string;
}

export const LoadingIndicator: React.FC<LoadingProps> = ({
  label = CHAT_CONFIG.thinkingText,
}) => {
  const error = useMessageError();

  if (error !== undefined) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-muted/40 border border-border/40 text-muted-foreground w-fit animate-in fade-in duration-300">
      <div className="flex items-center gap-1">
        <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <span className="size-1.5 rounded-full bg-primary animate-bounce" />
      </div>
      <div className="flex items-center gap-1.5 text-xs font-medium">
        <Sparkles className="size-3 text-primary animate-pulse" />
        <span>{label}</span>
      </div>
    </div>
  );
};
