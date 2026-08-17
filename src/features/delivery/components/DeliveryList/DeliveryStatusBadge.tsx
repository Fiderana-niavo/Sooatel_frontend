import React from "react";
import { DELIVERY_STATUS_LABELS } from "../../types/delivery.type";

interface DeliveryStatusBadgeProps {
  status: number | string;
}

export const DeliveryStatusBadge: React.FC<DeliveryStatusBadgeProps> = ({ status }) => {
  let badgeColor = "bg-gray-100 text-gray-800 border-gray-200";
  const statusStr = typeof status === 'number' ? DELIVERY_STATUS_LABELS[status] : status;

  if (statusStr === "Ouvert" || status === 5) {
    badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
  } else if (statusStr === "Validé" || status === 0) {
    badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeColor}`}>
      {statusStr || "Inconnu"}
    </span>
  );
};
