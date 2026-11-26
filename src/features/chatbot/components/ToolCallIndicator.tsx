import React from "react";
import { Loader2, CheckCircle2, Wrench } from "lucide-react";
import { getToolLabel } from "../utils/chatbot.utils";

interface ToolCallProps {
  toolName: string;
  isComplete?: boolean;
}

export const ToolCallIndicator: React.FC<ToolCallProps> = ({
  toolName,
  isComplete = false,
}) => {
  const label = getToolLabel(toolName);

  return (
    <div className="flex items-center gap-2.5 my-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20 text-xs text-foreground w-fit animate-in fade-in">
      {isComplete ? (
        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
      ) : (
        <Loader2 className="size-3.5 text-primary animate-spin shrink-0" />
      )}
      <Wrench className="size-3 text-muted-foreground shrink-0" />
      <span className="font-medium text-muted-foreground">{label}</span>
    </div>
  );
};
