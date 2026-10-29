import React, { useState } from "react";
import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";

interface CodeProps {
  className?: string;
  children?: React.ReactNode;
}

const PreBlock: React.FC<CodeProps> = ({ children }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = String(children ?? "");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="relative group my-3 rounded-xl border border-border/70 bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/50 bg-muted/40 text-[11px] text-muted-foreground">
        <span className="font-mono">Code</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-muted transition-colors cursor-pointer text-[11px]"
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-500" />
              <span className="text-emerald-500">Copié</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copier</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 text-xs font-mono overflow-x-auto custom-scrollbar leading-relaxed">
        {children}
      </pre>
    </div>
  );
};

export const MarkdownContent: React.FC = () => {
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm]}
      smooth={true}
      className="text-sm leading-relaxed space-y-2.5 text-foreground/90 break-words"
      components={{
        pre: PreBlock,
        code: ({ children, className }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="px-1.5 py-0.5 rounded-md bg-muted text-xs font-mono text-primary font-medium">
                {children}
              </code>
            );
          }
          return <code className={className}>{children}</code>;
        },
        table: ({ children }) => (
          <div className="overflow-x-auto my-3 rounded-lg border border-border">
            <table className="w-full text-left text-xs border-collapse">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-muted/70 text-foreground font-semibold border-b border-border">
            {children}
          </thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-border/50">{children}</tbody>
        ),
        tr: ({ children }) => (
          <tr className="hover:bg-muted/20 transition-colors">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-3 py-2 text-xs font-semibold">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 text-xs text-muted-foreground">{children}</td>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary/50 pl-3 py-1 my-2 bg-primary/5 rounded-r-md italic text-xs text-foreground/80">
            {children}
          </blockquote>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm my-2">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 space-y-1 text-xs sm:text-sm my-2">
            {children}
          </ol>
        ),
        h1: ({ children }) => (
          <h1 className="text-base font-bold text-foreground mt-3 mb-1">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-sm font-bold text-foreground mt-2 mb-1">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xs sm:text-sm font-semibold text-foreground mt-2 mb-1">
            {children}
          </h3>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
      }}
    />
  );
};
