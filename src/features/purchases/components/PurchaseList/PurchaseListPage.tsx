import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { purchaseService } from "../../services/purchase.service";
import { Button } from "@/components/ui/Button/button";
import { formatCurrency } from "../../../../utils/formatters";
import { Eye, Plus } from "lucide-react";
import { PurchaseDetailSheet } from "./PurchaseDetailSheet";
import { PurchaseStatusBadge } from "./PurchaseStatusBadge";

export function PurchaseListPage({ onGoToCreate }: { onGoToCreate?: () => void }) {
  const [page] = useState(1);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);

  const result = useQuery({
    queryKey: ["purchases", page],
    queryFn: () => purchaseService.getAll({ page, limit: 10 })
  });

  const { data, isLoading } = result;

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Commandes Fournisseurs</h1>
        <Button onClick={onGoToCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Commande
        </Button>
      </div>

      <div className="border border-border/50 shadow-sm rounded-lg bg-card text-card-foreground">
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Référence</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Fournisseur</th>
                  <th className="px-6 py-4 font-semibold text-right">Total</th>
                  <th className="px-6 py-4 font-semibold text-center">Statut</th>
                  <th className="px-6 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Chargement des commandes...</td>
                  </tr>
                ) : data?.records?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Aucune commande trouvée.</td>
                  </tr>
                ) : (
                  data?.records.map((purchase) => (
                    <tr key={purchase.idPurchase} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{purchase.ref}</td>
                      <td className="px-6 py-4">{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{purchase.supplier?.name}</td>
                      <td className="px-6 py-4 text-right font-medium">{formatCurrency(purchase.totalAmount)}</td>
                      <td className="px-6 py-4 text-center">
                        <PurchaseStatusBadge status={purchase.status} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedPurchaseId(purchase.idPurchase)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PurchaseDetailSheet
        idPurchase={selectedPurchaseId}
        onClose={() => setSelectedPurchaseId(null)}
      />
    </div>
  );
}
