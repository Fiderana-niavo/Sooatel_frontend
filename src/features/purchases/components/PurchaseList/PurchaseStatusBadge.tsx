import React from "react";
import { PURCHASE_STATUS_LABELS } from "../../types/purchase.type";

interface PurchaseStatusBadgeProps {
  status: number | string;
  className?: string;
}

export const PurchaseStatusBadge: React.FC<PurchaseStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  let badgeColor = "bg-gray-100 text-gray-800 border-gray-200";
  const statusStr =
    typeof status === "number" ? PURCHASE_STATUS_LABELS[status] : status;

  if (statusStr === "Créé" || status === 6) {
    badgeColor = "bg-blue-100 text-blue-800 border-blue-200";
  } else if (
    statusStr === "Partiel" ||
    statusStr === "Partiellement Livré" ||
    status === 3
  ) {
    badgeColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
  } else if (statusStr === "Livré" || status === 0) {
    badgeColor = "bg-green-100 text-green-800 border-green-200";
  }

  return (
    <span
      className={`inline-block px-1.5 md:px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium border max-w-full truncate leading-tight ${badgeColor} ${className}`}
      title={statusStr || "Inconnu"}
    >
      {statusStr || "Inconnu"}
    </span>
  );
};
