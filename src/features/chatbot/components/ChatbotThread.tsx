import React from "react";
import { ThreadPrimitive } from "@assistant-ui/react";
import { ChatbotHeader } from "./ChatbotHeader";
import { MessageList } from "./MessageList";
import { ComposerInput } from "./ComposerInput";

interface ThreadProps {
  onReset?: () => void;
}

export const ChatbotThread: React.FC<ThreadProps> = ({ onReset }) => {
  return (
    <ThreadPrimitive.Root className="flex flex-col h-full flex-1 min-h-0 w-full overflow-hidden">
      <ChatbotHeader onReset={onReset} />
      <MessageList />
      <ComposerInput />
    </ThreadPrimitive.Root>
  );
};
