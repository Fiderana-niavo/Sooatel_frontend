import { useState, useCallback } from "react";
import { InventorySheet } from "./InventorySheet";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import type { SnackbarType } from "@/components/ui/Snackbar/snackbar";

export function InventoryPage() {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: SnackbarType;
  }>({ open: false, message: "", type: "success" });

  const showSnackbar = useCallback((message: string, type: SnackbarType) => {
    setSnackbar({ open: true, message, type });
  }, []);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Inventaire Physique</h2>
        <p className="text-muted-foreground">
          Saisissez les quantités physiques comptées pour ajuster les écarts avec le stock théorique.
        </p>
      </div>

      <div className="flex-1 bg-card rounded-xl border border-border/50 p-6 shadow-sm overflow-hidden">
        <InventorySheet 
          onSuccess={(msg) => showSnackbar(msg, "success")}
          onError={(msg) => showSnackbar(msg, "error")}
        />
      </div>

      {snackbar.open && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        />
      )}
    </div>
  );
}
