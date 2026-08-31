import { Eye, CheckCircle2, Edit, Ban, PackageCheck } from "lucide-react";
import type { Purchase } from "../types/purchase.type";

export interface PurchaseActionCallbacks {
  onDetails: (id: string) => void;
  onConfirm: (purchase: Purchase) => void;
  onEdit: (purchase: Purchase) => void;
  onCancel: (purchase: Purchase) => void;

  onConfirmAndReceive: (purchase: Purchase) => void;
  onReceive: (purchase: Purchase) => void;
}

export const getPurchaseDropdownActions = (
  purchase: Purchase,
  activeTab: string,
  callbacks: PurchaseActionCallbacks
) => {
  const isConfirmed = purchase.status !== "Non confirmé";
  const isCancelled = purchase.status === "Annulé";
  const isOpen = purchase.status === "Ouvert";

  return [
    {
      label: "Détails",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => callbacks.onDetails(purchase.idPurchase),
    },
    {
      label: "Confirmer",
      icon: <CheckCircle2 className="h-4 w-4" />,
      onClick: () => callbacks.onConfirm(purchase),
      hidden: activeTab === "annulees" || !isOpen,
      className: "text-blue-600 dark:text-blue-400 hover:text-blue-700",
    },
    {
      label: "Modifier",
      icon: <Edit className="h-4 w-4" />,
      onClick: () => callbacks.onEdit(purchase),
      hidden: activeTab === "annulees" || isCancelled || purchase.status === "Livré" || purchase.status === 0,
      className: "text-orange-600 dark:text-orange-400 hover:text-orange-700",
    },
    {
      label: "Annuler",
      icon: <Ban className="h-4 w-4" />,
      onClick: () => callbacks.onCancel(purchase),
      hidden: activeTab === "annulees" || isCancelled || purchase.status === "Livré" || purchase.status === 0,
      className: "text-red-600 dark:text-red-400 hover:text-red-700",
    },

    {
      label: "Réception",
      icon: <PackageCheck className="h-4 w-4" />,
      onClick: () => {
        if (!isConfirmed) {
          callbacks.onConfirmAndReceive(purchase);
        } else {
          callbacks.onReceive(purchase);
        }
      },
      hidden: activeTab === "annulees" || purchase.status === "Livré",
      className: "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700",
    },
  ];
};
