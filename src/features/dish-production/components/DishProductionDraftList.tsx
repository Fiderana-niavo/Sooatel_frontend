import { Edit2, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { useState } from "react";
import type { DishProduction } from "../types";

interface Props {
  records: DishProduction[];
  isLoading: boolean;
  onEdit: (m: DishProduction) => void;
  onValidate: (m: DishProduction) => void;
  onDelete: (m: DishProduction) => void;
}

export function DishProductionDraftList({ records, isLoading, onEdit, onValidate, onDelete }: Props) {
  const [confirmTarget, setConfirmTarget] = useState<DishProduction | null>(null);
  const [validateTarget, setValidateTarget] = useState<DishProduction | null>(null);

  const handleConfirmDelete = () => {
    if (confirmTarget) onDelete(confirmTarget);
    setConfirmTarget(null);
  };

  const handleConfirmValidate = () => {
    if (validateTarget) onValidate(validateTarget);
    setValidateTarget(null);
  };

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Réf</th>
              <th className="px-4 py-3 font-medium">Article Produit</th>
              <th className="px-4 py-3 font-medium text-right">Quantité</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium max-w-[200px]">Notes</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <Loader2 className="size-5 animate-spin mx-auto text-muted-foreground" />
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                  Aucune production en brouillon
                </td>
              </tr>
            ) : (
              records.map((m) => (
                <tr key={m.idDishProduction} className="border-t hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{m.ref}</td>
                  <td className="px-4 py-3 font-medium">{m.item?.label ?? "-"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-primary">
                    {Number(m.quantity).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {m.productionDate ? new Date(m.productionDate).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "-"}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground" title={m.notes ?? ""}>
                    {m.notes || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" title="Modifier" onClick={() => onEdit(m)}>
                        <Edit2 className="size-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Valider" onClick={() => setValidateTarget(m)}>
                        <CheckCircle className="size-4 text-green-600" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Supprimer" onClick={() => setConfirmTarget(m)}>
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}
        title="Supprimer la saisie"
        description="Voulez-vous vraiment supprimer ce brouillon de production ?"
        onConfirm={handleConfirmDelete}
      />

      <ConfirmDialog
        open={!!validateTarget}
        onOpenChange={(open) => { if (!open) setValidateTarget(null); }}
        title="Valider la production"
        description="Attention : La validation va déduire les ingrédients du stock et ajouter le plat produit en stock. Cette action est irréversible. Confirmer ?"
        onConfirm={handleConfirmValidate}
      />
    </>
  );
}
