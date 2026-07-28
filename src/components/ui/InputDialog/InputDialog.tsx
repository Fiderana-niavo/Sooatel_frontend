import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";

interface InputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  placeholder?: string;
  confirmLabel?: string;
  onConfirm: (value: string) => void;
  loading?: boolean;
}

export function InputDialog({
  open,
  onOpenChange,
  title = "Saisie requise",
  description,
  placeholder = "Votre réponse...",
  confirmLabel = "Confirmer",
  onConfirm,
  loading = false,
}: InputDialogProps) {
  const [value, setValue] = React.useState("");

  const handleConfirm = () => {
    if (!value.trim()) return;
    onConfirm(value.trim());
    setValue("");
  };

  const handleClose = (open: boolean) => {
    if (!open) setValue("");
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          {description && (
            <DialogDescription className="mt-2 text-base text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <textarea
          className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring min-h-[96px]"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={loading}
          autoFocus
        />

        <DialogFooter className="mt-4 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={loading}
            className="rounded-xl px-6"
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !value.trim()}
            className="rounded-xl px-6"
          >
            {loading ? "Traitement..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
