import React from "react";
import { PURCHASE_STATUS_LABELS } from "../../types/purchase.type";

interface PurchaseStatusBadgeProps {
  status: number | string;
}

export const PurchaseStatusBadge: React.FC<PurchaseStatusBadgeProps> = ({ status }) => {
  let badgeColor = "bg-gray-100 text-gray-800 border-gray-200";
  const statusStr = typeof status === 'number' ? PURCHASE_STATUS_LABELS[status] : status;

  if (statusStr === "Créé" || status === 6) {
    badgeColor = "bg-blue-100 text-blue-800 border-blue-200";
  } else if (statusStr === "Partiellement Livré" || status === 3) {
    badgeColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
  } else if (statusStr === "Livré" || status === 0) {
    badgeColor = "bg-green-100 text-green-800 border-green-200";
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeColor}`}>
      {statusStr || "Inconnu"}
    </span>
  );
};
