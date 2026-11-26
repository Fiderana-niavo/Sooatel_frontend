import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { ActionBarPrimitive } from "@assistant-ui/react";
import { useMessageError } from "@assistant-ui/core/react";
import { CHAT_CONFIG } from "../constants/chatbot.constants";

interface ErrorProps {
  message?: string;
}

export const ErrorMessage: React.FC<ErrorProps> = ({
  message = CHAT_CONFIG.errorText,
}) => {
  const error = useMessageError();
  const detail =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : message;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="size-4 shrink-0 mt-0.5 text-destructive" />
        <div className="flex-1">
          <p className="font-medium text-xs sm:text-sm">{detail || message}</p>
        </div>
      </div>

      <ActionBarPrimitive.Reload asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive text-white hover:bg-destructive/90 transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className="size-3" />
          <span>{CHAT_CONFIG.retryText}</span>
        </button>
      </ActionBarPrimitive.Reload>
    </div>
  );
};

