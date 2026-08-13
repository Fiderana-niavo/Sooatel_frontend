import { useState } from "react";
import { PurchaseListPage } from "./PurchaseList/PurchaseListPage";
import { PurchasePosPage } from "./PurchasePosPage/PurchasePosPage";

export function PurchasesContainer() {
  const [view, setView] = useState<"list" | "create">("list");

  if (view === "create") {
    return (
      <div className="animate-in fade-in h-full">
        <PurchasePosPage onGoToList={() => setView("list")} />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in h-full">
      <PurchaseListPage onGoToCreate={() => setView("create")} />
    </div>
  );
}
