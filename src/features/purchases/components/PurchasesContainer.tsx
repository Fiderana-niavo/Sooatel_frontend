import { useState, useEffect } from "react";
import { PurchaseListPage } from "./PurchaseList/PurchaseListPage";
import { PurchasePosPage } from "./PurchasePosPage/PurchasePosPage";

export function PurchasesContainer({ onGoToDeliveries }: { onGoToDeliveries?: () => void }) {
  const [view, setView] = useState<"list" | "create" | "edit">(() => {
    const savedStr = sessionStorage.getItem("purchasesContainerSavedState");
    if (savedStr) {
      try { return JSON.parse(savedStr).view || "list"; } catch(e) {}
    }
    return "list";
  });
  
  const [idPurchaseToEdit, setIdPurchaseToEdit] = useState<string | undefined>(() => {
    const savedStr = sessionStorage.getItem("purchasesContainerSavedState");
    if (savedStr) {
      try { return JSON.parse(savedStr).idPurchaseToEdit; } catch(e) {}
    }
    return undefined;
  });

  useEffect(() => {
    sessionStorage.removeItem("purchasesContainerSavedState");
  }, []);

  if (view === "create" || view === "edit") {
    return (
      <div className="animate-in fade-in h-full">
        <PurchasePosPage 
          onGoToList={() => setView("list")} 
          idPurchaseToEdit={idPurchaseToEdit}
          onGoToDeliveries={(idPurchase) => {
            sessionStorage.setItem("purchasesContainerSavedState", JSON.stringify({ view, idPurchaseToEdit }));
            sessionStorage.setItem("deliveryFilter", JSON.stringify({ idPurchase, status: 5 /* OPEN */, returnToPurchases: true }));
            if (onGoToDeliveries) onGoToDeliveries();
          }}
        />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in h-full">
      <PurchaseListPage 
        onGoToDeliveries={onGoToDeliveries}
        onGoToCreate={() => {
          setIdPurchaseToEdit(undefined);
          setView("create");
        }} 
        onGoToEdit={(purchase) => {
          setIdPurchaseToEdit(purchase.idPurchase);
          setView("edit");
        }}
      />
    </div>
  );
}
