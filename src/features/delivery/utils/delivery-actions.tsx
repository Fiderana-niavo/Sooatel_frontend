import { Eye, CheckCircle2, Edit2, Trash2, CreditCard } from "lucide-react";

export interface DeliveryActionCallbacks {
  onDetails: (id: string) => void;
  onValidate: (id: string) => void;
  onEdit: (delivery: any) => void;
  onDelete: (id: string) => void;
  onPay: (id: string) => void;
}

export const getDeliveryDropdownActions = (
  delivery: any,
  callbacks: DeliveryActionCallbacks
) => {
  const actions: any[] = [
    {
      label: "Détails",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => callbacks.onDetails(delivery.idDelivery),
    },
  ];

  if (delivery.status === "Ouvert") {
    actions.push(
      {
        label: "Valider",
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
        onClick: () => callbacks.onValidate(delivery.idDelivery),
      },
      {
        label: "Modifier",
        icon: <Edit2 className="h-4 w-4 text-amber-500" />,
        onClick: () => callbacks.onEdit(delivery),
      },
      {
        label: "Supprimer",
        icon: <Trash2 className="h-4 w-4 text-red-500" />,
        onClick: () => callbacks.onDelete(delivery.idDelivery),
        className: "text-red-500 hover:bg-red-500/10",
      }
    );
  } else if (Number(delivery.balanceDue) > 0) {
    actions.push({
      label: "Payer",
      icon: <CreditCard className="h-4 w-4 text-violet-500" />,
      onClick: () => callbacks.onPay(delivery.idDelivery),
      className: "text-violet-600 dark:text-violet-400",
    });
  }

  return actions;
};
