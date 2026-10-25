import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
import {
  type TicketFormat,
  type TicketConfig,
  getTicketConfig,
  saveTicketConfig,
  MIN_WIDTH,
  MAX_WIDTH,
  PRESET_WIDTHS,
} from "../../../utils/ticketStorage";
import { Printer, Receipt, FileText, Sliders, Check, Lock, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/utils/ui";
import type { SaleRecord } from "../../../types";

interface PrintSaleModalProps {
  sale: SaleRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmPrint: (sale: SaleRecord, config: TicketConfig, win: Window | null) => Promise<void>;
  loading?: boolean;
}

interface FormatOption {
  id: TicketFormat;
  title: string;
  desc: string;
  badge?: string;
  icon: React.ReactNode;
}

const OPTIONS: FormatOption[] = [
  {
    id: "80mm",
    title: "Ticket 80 mm",
    desc: "Format standard pour imprimante thermique de caisse.",
    badge: "Recommandé",
    icon: <Receipt className="size-4 text-emerald-600" />,
  },
  {
    id: "58mm",
    title: "Ticket 58 mm",
    desc: "Format étroit pour imprimante thermique portable.",
    icon: <Receipt className="size-4 text-blue-600" />,
  },
  {
    id: "A5",
    title: "Facture A5",
    desc: "Demi-page (148 × 210 mm) pour imprimante classique.",
    icon: <FileText className="size-4 text-amber-600" />,
  },
  {
    id: "A4",
    title: "Facture A4",
    desc: "Pleine page (210 × 297 mm) pour facturation standard.",
    icon: <FileText className="size-4 text-purple-600" />,
  },
  {
    id: "custom",
    title: "Personnalisé",
    desc: "Largeur sur mesure en millimètres.",
    icon: <Sliders className="size-4 text-slate-600" />,
  },
];

export const PrintSaleModal: React.FC<PrintSaleModalProps> = ({
  sale,
  open,
  onOpenChange,
  onConfirmPrint,
  loading = false,
}) => {
  const [selected, setSelected] = useState<TicketFormat>("80mm");
  const [width, setWidth] = useState<number>(80);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const config = getTicketConfig();
      setSelected(config.type);
      setWidth(config.width);
      setError(null);
    }
  }, [open]);

  if (!sale) return null;

  const isClosed = sale.status === 0;

  const handleSelect = (format: TicketFormat) => {
    setSelected(format);
    setError(null);
    if (format !== "custom") {
      setWidth(PRESET_WIDTHS[format]);
    }
  };

  const handlePrint = async () => {
    let finalWidth = width;
    if (selected === "custom") {
      if (isNaN(finalWidth) || finalWidth < MIN_WIDTH || finalWidth > MAX_WIDTH) {
        setError(`Largeur requise entre ${MIN_WIDTH} et ${MAX_WIDTH} mm.`);
        return;
      }
    } else {
      finalWidth = PRESET_WIDTHS[selected];
    }

    const config: TicketConfig = {
      type: selected,
      width: finalWidth,
    };

    saveTicketConfig(config);

    // Synchronously open blank window to defeat browser popup blockers
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(
        `<!DOCTYPE html><html><head><title>Génération de l'impression...</title><style>body{font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#475569;background:#f8fafc;}</style></head><body><p>Préparation du document pour impression...</p></body></html>`,
      );
    }

    await onConfirmPrint(sale, config, win);
    onOpenChange(false);
  };

  const invoiceNum = sale.invoice?.invoiceNumber || sale.ref;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Printer className="size-5 text-primary" />
            Imprimer la vente #{invoiceNum}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Sélectionnez la taille du ticket ou de la facture avant d'imprimer.
          </DialogDescription>
        </DialogHeader>

        {!isClosed && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-semibold">Vente non fermée</p>
              <p className="mt-0.5">
                Cette vente est actuellement ouverte. En confirmant, elle sera automatiquement fermée puis imprimée.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 my-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Format de papier
          </label>
          <div className="grid grid-cols-1 gap-2">
            {OPTIONS.map((opt) => {
              const isChosen = selected === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all",
                    isChosen
                      ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                      : "border-border/60 hover:bg-muted/40 hover:border-border",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-background border border-border/50 shrink-0">
                      {opt.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground">
                          {opt.title}
                        </span>
                        {opt.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {opt.desc}
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "size-4 rounded-full border flex items-center justify-center shrink-0 ml-2",
                      isChosen
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30",
                    )}
                  >
                    {isChosen && <Check className="size-2.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>

          {selected === "custom" && (
            <div className="mt-1 p-2.5 rounded-xl border border-border/80 bg-muted/20 flex items-center gap-2">
              <span className="text-xs font-medium">Largeur :</span>
              <input
                type="number"
                min={MIN_WIDTH}
                max={MAX_WIDTH}
                value={width}
                onChange={(e) => {
                  setWidth(Number(e.target.value));
                  setError(null);
                }}
                className="flex h-8 w-20 rounded-md border border-input bg-background px-2 text-xs"
              />
              <span className="text-xs text-muted-foreground">mm ({MIN_WIDTH}-{MAX_WIDTH})</span>
              {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
            </div>
          )}
        </div>

        <DialogFooter className="mt-2 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={loading}>
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            disabled={loading}
            className={cn(!isClosed && "bg-blue-600 hover:bg-blue-700 text-white")}
          >
            {loading ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                Préparation...
              </>
            ) : !isClosed ? (
              <>
                <Lock className="size-3.5 mr-1.5" />
                Fermer et imprimer
              </>
            ) : (
              <>
                <Printer className="size-3.5 mr-1.5" />
                Imprimer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
