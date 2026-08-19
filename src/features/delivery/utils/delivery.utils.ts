import type { CreateDeliveryDto, PendingPurchase } from "../types/delivery.type";

export function buildDeliveryPayload(
  purchases: PendingPurchase[],
  activePurchaseIds: Set<string>,
  qtyMap: Map<string, number>
): CreateDeliveryDto {
  // Group item lines with qty > 0 and track affected purchases
  const lineMap = new Map<string, { quantity: number }>();
  const touchedPurchaseIds = new Set<string>();

  for (const purchase of purchases) {
    if (!activePurchaseIds.has(purchase.idPurchase)) continue;

    for (const detail of purchase.details) {
      const qty = qtyMap.get(detail.idPurchaseDetail) ?? 0;
      if (qty <= 0) continue;

      touchedPurchaseIds.add(purchase.idPurchase);

      // Merge if the same item appears in multiple purchases
      const existing = lineMap.get(detail.idSuppliedItem);
      if (existing) {
        existing.quantity += qty;
      } else {
        lineMap.set(detail.idSuppliedItem, { quantity: qty });
      }
    }
  }

  return {
    idPurchases: Array.from(touchedPurchaseIds),
    lines: Array.from(lineMap.entries()).map(([idSuppliedItem, { quantity }]) => ({
      idSuppliedItem,
      quantity,
    })),
  };
}

export function calculateCurrentTotalAmount(
  purchases: PendingPurchase[],
  activePurchaseIds: Set<string>,
  qtyMap: Map<string, number>
): number {
  let total = 0;
  for (const p of purchases) {
    if (!activePurchaseIds.has(p.idPurchase)) continue;
    for (const detail of p.details) {
      const qty = qtyMap.get(detail.idPurchaseDetail) ?? 0;
      total += qty * (detail.unitPrice ?? 0);
    }
  }
  return total;
}
