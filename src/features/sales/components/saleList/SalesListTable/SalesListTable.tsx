import React from "react";
import { Loader2, AlertTriangle, Eye, Edit } from "lucide-react";
import Pagination from "@/components/ui/Pagination/pagination";
import { ActionDropdown } from "@/components/ui/ActionDropdown/ActionDropdown";
import { SaleStatusBadge, PaymentStatusBadge } from "../SaleStatusBadge";
import { calcTotal } from "../../../utils/saleMappers";
import type { SaleRecord } from "../../../types";

interface SalesListTableProps {
  loading: boolean;
  sales: SaleRecord[];
  page: number;
  totalPages: number;
  onPageChange: (val: number) => void;
  onSaleClick: (sale: SaleRecord) => void;
  onEditSale: (sale: SaleRecord) => void;
  showCancelled: boolean;
}

export const SalesListTable: React.FC<SalesListTableProps> = ({
  loading,
  sales,
  page,
  totalPages,
  onPageChange,
  onSaleClick,
  onEditSale,
  showCancelled
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-16 text-muted-foreground">
        <Loader2 className="animate-spin size-8" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-sm">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border/50">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">N° Facture</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Vendeur</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Total</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Statut</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Paiement</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {sales.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-muted-foreground">
                  Aucune vente enregistrée.
                </td>
              </tr>
            )}
            {sales.map((sale) => {
              const computed = calcTotal(sale);
              const mismatch = Math.abs(Number(sale.totalAmount) - computed) > 0.01;
              const salerName = sale.saler
                ? `${sale.saler.name} ${sale.saler.lastname}`
                : "—";

              return (
                <tr
                  key={sale.idSale}
                  onClick={() => onSaleClick(sale)}
                  className="hover:bg-muted/20 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(sale.saleDate).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 font-mono font-medium">{(sale.invoice?.invoiceNumber ?? "")}</td>
                  <td className="px-4 py-3">{salerName}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={mismatch ? "text-orange-500 font-semibold inline-flex items-center gap-1" : "font-semibold"}>
                      {mismatch && <AlertTriangle size={12} />}
                      {Number(sale.totalAmount).toLocaleString("fr-FR")} Ar
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <SaleStatusBadge status={sale.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <PaymentStatusBadge status={sale.invoice?.status} totalAmount={sale.totalAmount} balanceDue={(sale.invoice?.balanceDue ?? sale.totalAmount)} />
                  </td>
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <ActionDropdown
                      items={[
                        {
                          label: "Détails",
                          icon: <Eye className="size-4" />,
                          onClick: () => onSaleClick(sale)
                        },
                        {
                          label: "Modifier",
                          icon: <Edit className="size-4" />,
                          hidden: showCancelled || sale.status === -3 || sale.status === 0,
                          onClick: () => onEditSale(sale)
                        }
                      ]}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="border-t border-border/50 px-4 py-3">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};
