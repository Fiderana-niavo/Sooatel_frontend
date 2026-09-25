import React, { useEffect } from "react";
import { Input } from "@/components/ui/Inputs/input";
import { CurrencyInput } from "@/components/ui/Inputs/CurrencyInput";
import { PackageCheck } from "lucide-react";
import type { SuppliedItem, DeliveryLineDto } from "../../types/purchase.type";
import { formatCurrency } from "../../../../utils/formatters";

interface PurchaseDeliveryFormProps {
  details: { idSuppliedItem: string; quantity: number; unitPrice: number }[];
  deliveryLines?: DeliveryLineDto[];
  suppliedItems: SuppliedItem[];
  onChangeDeliveryLines: (lines: DeliveryLineDto[]) => void;
}

export const PurchaseDeliveryForm: React.FC<PurchaseDeliveryFormProps> = ({
  details,
  deliveryLines = [],
  suppliedItems,
  onChangeDeliveryLines,
}) => {
  // Sync deliveryLines whenever details change if deliveryLines is empty or has length/item mismatch
  useEffect(() => {
    const needsSync =
      !deliveryLines ||
      deliveryLines.length !== details.length ||
      details.some(
        (d, idx) => !deliveryLines[idx] || deliveryLines[idx].idSuppliedItem !== d.idSuppliedItem
      );

    if (needsSync) {
      const initialLines: DeliveryLineDto[] = details.map((d) => ({
        idSuppliedItem: d.idSuppliedItem,
        quantity: d.quantity,
        unitPrice: d.unitPrice,
      }));
      onChangeDeliveryLines(initialLines);
    }
  }, [details, deliveryLines, onChangeDeliveryLines]);

  const getSuppliedItemLabel = (idSuppliedItem: string) => {
    const found = suppliedItems.find((si) => si.idSuppliedItem === idSuppliedItem);
    return found?.item?.label || "Article inconnu";
  };

  const handleQtyChange = (index: number, qty: number) => {
    const updated = [...(deliveryLines.length ? deliveryLines : details.map((d) => ({ ...d })))];
    if (updated[index]) {
      const safeQty = isNaN(qty) ? 0 : Math.max(0, qty);
      updated[index] = { ...updated[index], quantity: safeQty };
      onChangeDeliveryLines(updated);
    }
  };

  const handlePriceChange = (index: number, price: number) => {
    const updated = [...(deliveryLines.length ? deliveryLines : details.map((d) => ({ ...d })))];
    if (updated[index]) {
      const safePrice = isNaN(price) ? 0 : Math.max(0, price);
      updated[index] = { ...updated[index], unitPrice: safePrice };
      onChangeDeliveryLines(updated);
    }
  };

  const linesToRender = deliveryLines.length === details.length
    ? deliveryLines
    : details.map((d) => ({
        idSuppliedItem: d.idSuppliedItem,
        quantity: d.quantity,
        unitPrice: d.unitPrice,
      }));

  const totalDeliveryAmount = linesToRender.reduce(
    (sum, line) => sum + line.quantity * line.unitPrice,
    0
  );

  return (
    <div className="bg-card p-6 rounded-xl border border-primary/30 shadow-sm space-y-4 bg-emerald-500/5">
      <div className="flex items-center gap-3 mb-2">
        <PackageCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        <div>
          <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
            Formulaire de Réception / Livraison Directe
          </h3>
          <p className="text-xs text-muted-foreground">
            Saisissez ci-dessous les quantités réelles et prix unitaires reçus sur le moment.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/40">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Article</th>
              <th className="px-4 py-2.5 text-right font-medium">Commandé</th>
              <th className="px-4 py-2.5 text-right font-medium">Prix unité (Ar)</th>
              <th className="px-4 py-2.5 text-right font-medium">Reçu maintenant</th>
              <th className="px-4 py-2.5 text-right font-medium">Total Livraison (Ar)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 bg-card">
            {details.map((detail, idx) => {
              const delLine = linesToRender[idx] || detail;
              const lineTotal = delLine.quantity * delLine.unitPrice;

              return (
                <tr key={idx} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">
                    {getSuppliedItemLabel(detail.idSuppliedItem)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {detail.quantity}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <CurrencyInput
                      placeholder="0"
                      value={delLine.unitPrice}
                      onChange={(val) => handlePriceChange(idx, val || 0)}
                      currencySuffix="Ar"
                      className="w-32 text-right ml-auto text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={delLine.quantity === 0 ? "" : delLine.quantity}
                      onChange={(e) => handleQtyChange(idx, e.target.value === "" ? 0 : parseFloat(e.target.value))}
                      onBlur={(e) => {
                        if (e.target.value === "") handleQtyChange(idx, 0);
                      }}
                      className="w-24 text-right ml-auto text-sm font-semibold border-emerald-500/50 focus:ring-emerald-500/40"
                    />
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(lineTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-3">
        <div className="flex items-center gap-4 bg-emerald-500/10 px-4 py-3 rounded-lg border border-emerald-500/30">
          <span className="font-semibold text-emerald-800 dark:text-emerald-200 text-sm">
            Total Réceptionné :
          </span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalDeliveryAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};
