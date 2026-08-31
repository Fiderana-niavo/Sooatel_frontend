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
import { cn } from "@/utils/ui";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  onConfirm: () => void;
  loading?: boolean;
  cancelText?: React.ReactNode;
  confirmText?: React.ReactNode;
  loadingText?: React.ReactNode;
  confirmButtonClassName?: string;
  hideConfirmButton?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Confirmation",
  description,
  children,
  onConfirm,
  loading = false,
  cancelText = "Annuler",
  confirmText = "Confirmer",
  loadingText = "Traitement...",
  confirmButtonClassName,
  hideConfirmButton = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          {description && (
            <DialogDescription className="mt-2 text-base text-muted-foreground asChild={typeof description !== 'string'}">
              {typeof description === 'string' ? <p>{description}</p> : description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        {children && <div className="py-2 overflow-y-auto max-h-[65vh] pr-2 -mr-2">{children}</div>}

        <DialogFooter className="mt-4 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-xl px-6 flex-1 sm:flex-none"
          >
            {cancelText}
          </Button>
          {!hideConfirmButton && (
            <Button
              variant={confirmButtonClassName ? "default" : "destructive"}
              onClick={onConfirm}
              disabled={loading}
              className={cn("rounded-xl px-6 flex-1 sm:flex-none", confirmButtonClassName)}
            >
              {loading ? loadingText : confirmText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
