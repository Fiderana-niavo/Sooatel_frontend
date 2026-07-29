import React from "react";
import { Badge } from "@/components/ui/Badge/badge";
import { cn } from "@/utils/ui";

interface SaleStatusBadgeProps {
  status: number | null;
}

const STATUS_MAP: Record<number, { label: string; className: string }> = {
  5: { label: "Ouverte",  className: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  0: { label: "Fermée",    className: "bg-green-500/15 text-green-700 border-green-500/30" },
  "-3": { label: "Annulée",  className: "bg-red-500/15 text-red-600 border-red-500/30" },
};

export const SaleStatusBadge: React.FC<SaleStatusBadgeProps> = ({ status }) => {
  const config = status !== null && status !== undefined ? STATUS_MAP[status] : null;
  if (!config) {
    return <Badge variant="outline" className="text-xs">Inconnu</Badge>;
  }
  return (
    <Badge variant="outline" className={cn("text-xs font-semibold whitespace-nowrap", config.className)}>
      {config.label}
    </Badge>
  );
};

const PAYMENT_STATUS_MAP: Record<number, { label: string; className: string }> = {
  0: { label: "Payé", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
  3: { label: "Partiellement Payé", className: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  5: { label: "Impayé", className: "bg-rose-500/15 text-rose-700 border-rose-500/30" },
};

interface PaymentStatusBadgeProps {
  status?: number | null;
  totalAmount?: number | null;
  balanceDue?: number | null;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, totalAmount, balanceDue }) => {
  if (status !== undefined && status !== null) {
    const config = PAYMENT_STATUS_MAP[status];
    if (config) {
      return (
        <Badge variant="outline" className={cn("text-xs font-semibold whitespace-nowrap", config.className)}>
          {config.label}
        </Badge>
      );
    }
  }

  // Fallback to calculation if status is not provided
  const total = Number(totalAmount || 0);
  const balance = balanceDue !== null && balanceDue !== undefined ? Number(balanceDue) : total;

  if (total === 0) return null; // Or 'Payé' for zero-amount sales if applicable

  if (balance <= 0) {
    return (
      <Badge variant="outline" className="text-xs font-semibold whitespace-nowrap bg-emerald-500/15 text-emerald-700 border-emerald-500/30">
        Payé
      </Badge>
    );
  }

  if (balance < total) {
    return (
      <Badge variant="outline" className="text-xs font-semibold whitespace-nowrap bg-amber-500/15 text-amber-700 border-amber-500/30">
        Partiellement Payé
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-xs font-semibold whitespace-nowrap bg-rose-500/15 text-rose-700 border-rose-500/30">
      Impayé
    </Badge>
  );
};
