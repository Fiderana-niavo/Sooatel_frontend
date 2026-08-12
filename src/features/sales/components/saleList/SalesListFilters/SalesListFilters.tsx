import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { SearchableSelect } from "@/components/ui/Inputs/SearchableSelect";

interface SalesListFiltersProps {
  showCancelled: boolean;
  onToggleCancelled: () => void;
  dateFilter: string;
  onDateFilterChange: (val: string) => void;
  menuFilter: string | number;
  onMenuFilterChange: (val: string | number) => void;
  menuOptions: { value: string; label: string }[];
  paymentStatusFilter: string;
  onPaymentStatusFilterChange: (val: string) => void;
}

export const SalesListFilters: React.FC<SalesListFiltersProps> = ({
  showCancelled,
  onToggleCancelled,
  dateFilter,
  onDateFilterChange,
  menuFilter,
  onMenuFilterChange,
  menuOptions,
  paymentStatusFilter,
  onPaymentStatusFilterChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{showCancelled ? "Ventes annulées" : "Historique des ventes"}</h2>
        <p className="text-muted-foreground mt-1 text-sm">{showCancelled ? "Consultez les ventes qui ont été annulées." : "Consultez et gérez toutes les ventes enregistrées."}</p>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
        <Button
          variant={showCancelled ? "default" : "outline"}
          onClick={onToggleCancelled}
          className="flex items-center gap-2"
        >
          <AlertTriangle size={16} />
          {showCancelled ? "Retour à l'historique" : "Ventes annulées"}
        </Button>

        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value)}
          className="w-full sm:w-[160px]"
        />
        <div className="w-full sm:w-[220px]">
          <SearchableSelect
            options={menuOptions}
            value={menuFilter}
            onChange={onMenuFilterChange}
            placeholder="Filtrer par produit..."
          />
        </div>
        <select
          className="w-full sm:w-[160px] flex h-10 items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={paymentStatusFilter}
          onChange={(e) => onPaymentStatusFilterChange(e.target.value)}
        >
          <option value="">Tous statuts paiement</option>
          <option value="PAID">Payé</option>
          <option value="UNPAID">Non payé</option>
          <option value="PARTIAL">Partiel</option>
        </select>
      </div>
    </div>
  );
};
