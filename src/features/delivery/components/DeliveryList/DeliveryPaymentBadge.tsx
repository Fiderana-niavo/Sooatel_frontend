import React from "react";
import { Badge } from "@/components/ui/Badge/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface DeliveryPaymentBadgeProps {
  status: string;
}

export const DeliveryPaymentBadge: React.FC<DeliveryPaymentBadgeProps> = ({
  status,
}) => {
  switch (status) {
    case "PAID":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 flex items-center gap-1 w-fit whitespace-nowrap"
        >
          <CheckCircle2 className="h-3 w-3" />
          Payé
        </Badge>
      );
    case "PARTIAL":
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 flex items-center gap-1 w-fit whitespace-nowrap"
        >
          <Clock className="h-3 w-3" />
          Partiel
        </Badge>
      );
    case "UNPAID":
      return (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 flex items-center gap-1 w-fit whitespace-nowrap"
        >
          <AlertCircle className="h-3 w-3" />
          Non payé
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-muted text-muted-foreground border-border flex items-center gap-1 w-fit"
        >
          -
        </Badge>
      );
  }
};
