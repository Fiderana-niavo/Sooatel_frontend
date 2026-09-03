import type { CreateDeliveryDto, PendingPurchase } from "../types/delivery.type";

export function buildDeliveryPayload(
  purchases: PendingPurchase[],
  activePurchaseIds: Set<string>,
  qtyMap: Map<string, number>,
  priceMap: Map<string, number>
): CreateDeliveryDto {
  // Group item lines with qty > 0 and track affected purchases
  const lineMap = new Map<string, { quantity: number; unitPrice: number }>();
  const touchedPurchaseIds = new Set<string>();

  for (const purchase of purchases) {
    if (!activePurchaseIds.has(purchase.idPurchase)) continue;

    for (const detail of purchase.details) {
      const qty = qtyMap.get(detail.idPurchaseDetail) ?? 0;
      if (qty <= 0) continue;

      touchedPurchaseIds.add(purchase.idPurchase);

      const price = priceMap.get(detail.idPurchaseDetail) ?? Number(detail.unitPrice) ?? 0;

      // Merge if the same item appears in multiple purchases
      const existing = lineMap.get(detail.idSuppliedItem);
      if (existing) {
        existing.quantity += qty;
        // In case of merge, we might want to keep the latest price or average. 
        // For simplicity, we just keep the current price. 
        // A robust solution might do a weighted average if they differ, but typically they don't in a single delivery of the same item.
        existing.unitPrice = price;
      } else {
        lineMap.set(detail.idSuppliedItem, { quantity: qty, unitPrice: price });
      }
    }
  }

  return {
    idPurchases: Array.from(touchedPurchaseIds),
    lines: Array.from(lineMap.entries()).map(([idSuppliedItem, { quantity, unitPrice }]) => ({
      idSuppliedItem,
      quantity,
      unitPrice,
    })),
  };
}

export function calculateCurrentTotalAmount(
  purchases: PendingPurchase[],
  activePurchaseIds: Set<string>,
  qtyMap: Map<string, number>,
  priceMap: Map<string, number>
): number {
  let total = 0;
  for (const p of purchases) {
    if (!activePurchaseIds.has(p.idPurchase)) continue;
    for (const detail of p.details) {
      const qty = qtyMap.get(detail.idPurchaseDetail) ?? 0;
      const price = priceMap.get(detail.idPurchaseDetail) ?? Number(detail.unitPrice) ?? 0;
      total += qty * price;
    }
  }
  return total;
}
