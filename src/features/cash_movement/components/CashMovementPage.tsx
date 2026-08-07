import { useState } from "react";
import { CashMovementCategoryList } from "../category/components/CashMovementCategoryList";
import { CashMovementList } from "../movement/components/CashMovementList";
import { CashJournalPage } from "./CashJournalPage";

export function CashMovementPage() {
  const [activeSubTab, setActiveSubTab] = useState<"journals" | "outflows" | "inflows" | "categories">("journals");

  const tabs = [
    { key: "journals" as const, label: "Journaux" },
    { key: "outflows" as const, label: "Sorties de Caisse" },
    { key: "inflows" as const, label: "Entrées d'argent" },
    { key: "categories" as const, label: "Catégories" },
  ];

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <div className="flex items-center gap-4 border-b border-border pb-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`pb-2 text-sm font-semibold transition-colors relative ${
              activeSubTab === tab.key
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveSubTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {activeSubTab === "journals" && <CashJournalPage />}
        {activeSubTab === "outflows" && <CashMovementList direction={-5} />}
        {activeSubTab === "inflows" && <CashMovementList direction={5} />}
        {activeSubTab === "categories" && <CashMovementCategoryList />}
      </div>
    </div>
  );
}
