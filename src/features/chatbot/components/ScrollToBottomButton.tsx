import React from "react";
import { ThreadPrimitive } from "@assistant-ui/react";
import { ArrowDown } from "lucide-react";

export const ScrollToBottomButton: React.FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <button
        type="button"
        className="absolute bottom-4 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/95 hover:bg-card border border-border shadow-md text-xs font-medium text-foreground hover:text-primary transition-opacity duration-200 cursor-pointer backdrop-blur-sm z-10 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
        title="Faire défiler jusqu'en bas"
      >
        <ArrowDown className="size-3.5" />
        <span>Derniers messages</span>
      </button>
    </ThreadPrimitive.ScrollToBottom>
  );
};
