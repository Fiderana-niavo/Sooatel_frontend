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
import { Receipt, FileText, Sliders, Check, Info } from "lucide-react";
import { cn } from "@/utils/ui";

interface TicketFormatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (config: TicketConfig) => void;
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
    desc: "Format standard pour imprimante thermique de caisse (recommandé).",
    badge: "Par défaut",
    icon: <Receipt className="size-5 text-emerald-600" />,
  },
  {
    id: "58mm",
    title: "Ticket 58 mm",
    desc: "Format étroit pour petites imprimantes thermiques de caisse ou portables.",
    icon: <Receipt className="size-5 text-blue-600" />,
  },
  {
    id: "A5",
    title: "Facture A5",
    desc: "Demi-page (148 × 210 mm) pour imprimante de bureau standard.",
    icon: <FileText className="size-5 text-amber-600" />,
  },
  {
    id: "A4",
    title: "Facture A4",
    desc: "Pleine page (210 × 297 mm) classique avec mise en page complète.",
    icon: <FileText className="size-5 text-purple-600" />,
  },
  {
    id: "custom",
    title: "Largeur personnalisée",
    desc: "Spécifiez la largeur exacte du rouleau en millimètres.",
    icon: <Sliders className="size-5 text-slate-600" />,
  },
];

export const TicketFormatModal: React.FC<TicketFormatModalProps> = ({
  open,
  onOpenChange,
  onSave,
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

  const handleSelect = (format: TicketFormat) => {
    setSelected(format);
    setError(null);
    if (format !== "custom") {
      setWidth(PRESET_WIDTHS[format]);
    }
  };

  const handleSave = () => {
    let finalWidth = width;
    if (selected === "custom") {
      if (isNaN(finalWidth) || finalWidth < MIN_WIDTH || finalWidth > MAX_WIDTH) {
        setError(`La largeur doit être comprise entre ${MIN_WIDTH} et ${MAX_WIDTH} mm.`);
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
    onSave?.(config);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Receipt className="size-5 text-primary" />
            Format d'impression du ticket
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Choisissez la dimension de papier pour les tickets et factures générés.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 my-2">
          {OPTIONS.map((opt) => {
            const isChosen = selected === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                  isChosen
                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                    : "border-border/60 hover:bg-muted/40 hover:border-border",
                )}
              >
                <div className="p-2 rounded-lg bg-background border border-border/50 shrink-0 mt-0.5">
                  {opt.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {opt.title}
                    </span>
                    {opt.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    {opt.desc}
                  </p>
                </div>
                <div
                  className={cn(
                    "size-5 rounded-full border flex items-center justify-center shrink-0 mt-1",
                    isChosen
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30",
                  )}
                >
                  {isChosen && <Check className="size-3 stroke-[3]" />}
                </div>
              </div>
            );
          })}

          {selected === "custom" && (
            <div className="mt-1 p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2">
              <label className="text-xs font-semibold text-foreground block">
                Largeur du ticket (en mm)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={MIN_WIDTH}
                  max={MAX_WIDTH}
                  value={width}
                  onChange={(e) => {
                    setWidth(Number(e.target.value));
                    setError(null);
                  }}
                  className="flex h-9 w-28 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
                <span className="text-xs font-medium text-muted-foreground">
                  mm ({MIN_WIDTH} à {MAX_WIDTH} mm)
                </span>
              </div>
              {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
          <Info className="size-4 shrink-0 mt-0.5 text-amber-600" />
          <span>
            <strong>Conseil d'impression :</strong> Dans la fenêtre de votre navigateur, réglez l'échelle sur <strong>100%</strong> et les marges sur <strong>« Aucune »</strong>.
          </span>
        </div>

        <DialogFooter className="mt-2 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
