import { Edit2, Trash2, CheckCircle, Loader2, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { useState } from "react";
import type { StockMovement } from "../../types/stock-movement.type";

const directionBadge = (isOut: boolean) =>
  `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
    isOut
      ? "bg-red-500/10 text-red-600"
      : "bg-green-500/10 text-green-600"
  }`;

interface Props {
  records: StockMovement[];
  isLoading: boolean;
  onEdit: (m: StockMovement) => void;
  onValidate: (m: StockMovement) => void;
  onDelete: (m: StockMovement) => void;
}

export function StockMovementDraftList({ records, isLoading, onEdit, onValidate, onDelete }: Props) {
  const [confirmTarget, setConfirmTarget] = useState<StockMovement | null>(null);

  const handleConfirmDelete = () => {
    if (confirmTarget) onDelete(confirmTarget);
    setConfirmTarget(null);
  };

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Réf</th>
              <th className="px-4 py-3 font-medium">Sens</th>
              <th className="px-4 py-3 font-medium">Article</th>
              <th className="px-4 py-3 font-medium text-right">Quantité</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium max-w-[200px]">Raison</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <Loader2 className="size-5 animate-spin mx-auto text-muted-foreground" />
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  Aucun brouillon en attente
                </td>
              </tr>
            ) : (
              records.map((m) => {
                const isOut = m.direction === -5;
                return (
                  <tr key={m.idStockMovement} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{m.ref}</td>
                    <td className="px-4 py-3">
                      <span className={directionBadge(isOut)}>
                        {isOut ? <ArrowDownCircle className="size-3" /> : <ArrowUpCircle className="size-3" />}
                        {isOut ? "Sortie" : "Entrée"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{m.item?.label ?? "-"}</span>
                      {m.item?.ref && <span className="text-xs text-muted-foreground ml-1">({m.item.ref})</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {Number(m.quantity).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {m.movementDate ? new Date(m.movementDate).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "-"}
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground" title={m.reason ?? ""}>
                      {m.reason || "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" title="Modifier" onClick={() => onEdit(m)}>
                          <Edit2 className="size-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Valider" onClick={() => onValidate(m)}>
                          <CheckCircle className="size-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Supprimer" onClick={() => setConfirmTarget(m)}>
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}
        title="Supprimer le brouillon"
        description="Voulez-vous vraiment supprimer ce mouvement ?"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
