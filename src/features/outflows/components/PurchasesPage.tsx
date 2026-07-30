import { useState } from "react";
import { OutflowCategoryList } from "../category/components/OutflowCategoryList";
import { CashOutflowList } from "../cash_outflow/components/CashOutflowList";

export function PurchasesPage() {
  const [activeSubTab, setActiveSubTab] = useState<"cashOutflows" | "categories">("cashOutflows");

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <div className="flex items-center gap-4 border-b border-border pb-2">
        <button
          className={`pb-2 text-sm font-semibold transition-colors relative ${
            activeSubTab === "cashOutflows"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveSubTab("cashOutflows")}
        >
          Sorties de Caisse
        </button>
        <button
          className={`pb-2 text-sm font-semibold transition-colors relative ${
            activeSubTab === "categories"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveSubTab("categories")}
        >
          Catégories de Dépenses
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {activeSubTab === "cashOutflows" ? (
          <CashOutflowList />
        ) : (
          <OutflowCategoryList />
        )}
      </div>
    </div>
  );
}
