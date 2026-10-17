import React from "react";
import { MessagePrimitive } from "@assistant-ui/react";
import { User } from "lucide-react";

export const UserMessage: React.FC = () => {
  return (
    <MessagePrimitive.Root className="flex justify-end items-end gap-2.5 my-3 pl-8 sm:pl-16">
      <div className="flex flex-col items-end max-w-full">
        <div className="rounded-2xl rounded-br-xs px-4 py-2.5 bg-primary text-primary-foreground text-sm shadow-sm break-words selection:bg-background/20">
          <MessagePrimitive.Parts />
        </div>
      </div>
      <div className="flex items-center justify-center size-8 rounded-full bg-primary/15 text-primary border border-primary/20 shrink-0">
        <User className="size-4" />
      </div>
    </MessagePrimitive.Root>
  );
};
