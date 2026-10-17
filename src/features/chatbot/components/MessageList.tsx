import React from "react";
import { ThreadPrimitive } from "@assistant-ui/react";
import { UserMessage } from "./UserMessage";
import { AssistantMessage } from "./AssistantMessage";
import { EmptyState } from "./EmptyState";
import { ScrollToBottomButton } from "./ScrollToBottomButton";

export const MessageList: React.FC = () => {
  return (
    <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden bg-transparent">
      <ThreadPrimitive.Viewport
        autoScroll={true}
        className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 py-6 custom-scrollbar scroll-smooth"
      >
        <EmptyState />

        <ThreadPrimitive.Messages>
          {({ message }) =>
            message.role === "user" ? <UserMessage /> : <AssistantMessage />
          }
        </ThreadPrimitive.Messages>
      </ThreadPrimitive.Viewport>

      <ScrollToBottomButton />
    </div>
  );
};
