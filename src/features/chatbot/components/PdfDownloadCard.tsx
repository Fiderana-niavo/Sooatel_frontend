import React from "react";
import { FileDown, FileText } from "lucide-react";

interface PdfDownloadCardProps {
  title: string;
  onDownload: () => void;
}

export const PdfDownloadCard: React.FC<PdfDownloadCardProps> = (props) => {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border border-border/70 bg-muted/30 px-3 py-2.5">
      <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10 text-primary shrink-0">
        <FileText className="size-4" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs font-semibold text-foreground truncate">
          {props.title}
        </span>
        <span className="text-[11px] text-muted-foreground">Document PDF</span>
      </div>
      <button
        type="button"
        onClick={props.onDownload}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer shrink-0"
      >
        <FileDown className="size-3.5" />
        Télécharger
      </button>
    </div>
  );
};
