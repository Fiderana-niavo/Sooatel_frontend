import React from "react";
import { ThreadPrimitive } from "@assistant-ui/react";
import { Bot, Sparkles, ArrowRight } from "lucide-react";
import { CHAT_SUGGESTIONS, CHAT_CONFIG } from "../constants/chatbot.constants";

export const EmptyState: React.FC = () => {
  return (
    <ThreadPrimitive.Empty>
      <div className="flex flex-col items-center justify-center p-4 sm:p-6 text-center max-w-xl mx-auto my-auto animate-in fade-in duration-500">
        <div className="relative flex items-center justify-center size-16 rounded-2xl bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-md mb-4 ring-4 ring-primary/10">
          <Bot className="size-8" />
          <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-background border border-border shadow-xs text-primary">
            <Sparkles className="size-3" />
          </span>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-1">
          {CHAT_CONFIG.name}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-md">
          {CHAT_CONFIG.subtitle}. Posez une question ou sélectionnez l'une des
          suggestions ci-dessous :
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
          {CHAT_SUGGESTIONS.map((item) => (
            <ThreadPrimitive.Suggestion
              key={item.id}
              prompt={item.prompt}
              send={true}
              asChild
            >
              <button
                type="button"
                className="group flex flex-col justify-between p-3.5 rounded-xl border border-border/70 bg-card hover:bg-muted/40 hover:border-primary/40 transition-all text-left shadow-xs cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {item.category}
                  </span>
                  <ArrowRight className="size-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs font-medium text-foreground line-clamp-2">
                  {item.prompt}
                </p>
              </button>
            </ThreadPrimitive.Suggestion>
          ))}
        </div>
      </div>
    </ThreadPrimitive.Empty>
  );
};
