import React, { useMemo, useState } from "react";
import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import { createChatAdapter, resetSession } from "../services/chatbot.service";
import { ChatbotThread } from "./ChatbotThread";
import type { ChatbotProps } from "../types/chatbot.types";

const ChatbotSession: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  const adapter = useMemo(() => createChatAdapter(), []);
  const runtime = useLocalRuntime(adapter);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ChatbotThread onReset={onReset} />
    </AssistantRuntimeProvider>
  );
};

export const ChatbotView: React.FC<ChatbotProps> = ({ className = "" }) => {
  const [key, setKey] = useState(0);

  const handleReset = () => {
    resetSession();
    setKey((prev) => prev + 1);
  };

  return (
    <div
      className={`flex flex-col h-full flex-1 min-h-0 w-full overflow-hidden ${className}`}
    >
      <ChatbotSession key={key} onReset={handleReset} />
    </div>
  );
};
