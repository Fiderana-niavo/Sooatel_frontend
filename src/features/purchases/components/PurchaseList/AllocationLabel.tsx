import { type AllocationDto } from "../../types/supplier-payment.type";
import { formatCurrency } from "@/utils/formatters";

interface Props {
  allocation: AllocationDto;
  destinations: any;
}

export const AllocationLabel = ({ allocation, destinations }: Props) => {
  if (allocation.allocationType === "DELIVERY") {
    const d = destinations?.deliveries.find((d: any) => d.idDelivery === allocation.idDelivery);
    return d ? (
      <>
        Livraison {d.ref} {d.purchaseRef && `(${d.purchaseRef})`} <span className="text-xs text-muted-foreground">({formatCurrency(d.balanceDue)})</span>
      </>
    ) : (
      <>Livraison</>
    );
  }
  return <>Crédit fournisseur</>;
};
