import React from "react";
import { AlertTriangle, ChevronDown, RotateCcw } from "lucide-react";
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
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  paymentStatusFilter: string;
  onPaymentStatusFilterChange: (val: string) => void;
  onResetFilters?: () => void;
}

export const SalesListFilters: React.FC<SalesListFiltersProps> = ({
  showCancelled,
  onToggleCancelled,
  dateFilter,
  onDateFilterChange,
  menuFilter,
  onMenuFilterChange,
  menuOptions,
  statusFilter,
  onStatusFilterChange,
  paymentStatusFilter,
  onPaymentStatusFilterChange,
  onResetFilters,
}) => {
  const hasActiveFilters = Boolean(
    dateFilter || menuFilter || statusFilter || paymentStatusFilter,
  );

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {showCancelled ? "Ventes annulées" : "Historique des ventes"}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {showCancelled
              ? "Consultez les ventes qui ont été annulées."
              : "Consultez et gérez toutes les ventes enregistrées."}
          </p>
        </div>
      </div>

      {/* Filter Controls: 2 harmonious rows with identical dimensions and styles */}
      <div className="flex flex-col gap-3 p-3 sm:p-4 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm">
        {/* Top Row: Cancelled Toggle, Date, Menu Item */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={showCancelled ? "default" : "outline"}
            onClick={onToggleCancelled}
            className="flex items-center gap-2 h-10 rounded-xl px-4 shrink-0 font-medium w-full sm:w-[190px] justify-center"
          >
            <AlertTriangle size={16} />
            {showCancelled ? "Retour à l'historique" : "Ventes annulées"}
          </Button>

          <div className="w-full sm:w-[190px]">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => onDateFilterChange(e.target.value)}
              className="h-10 rounded-xl bg-background border-input"
            />
          </div>

          <div className="w-full sm:w-[240px]">
            <SearchableSelect
              options={menuOptions}
              value={menuFilter}
              onChange={onMenuFilterChange}
              placeholder="Tous les produits"
            />
          </div>
        </div>

        {/* Bottom Row: Sale Status (Ouverte/Fermée), Payment Status, Reset Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sale Status Filter */}
          <div className="relative w-full sm:w-[190px]">
            <select
              className="w-full h-10 appearance-none rounded-xl border border-input bg-background pl-3 pr-8 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring hover:border-accent-foreground/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              disabled={showCancelled}
            >
              <option value="">Tous les statuts</option>
              <option value="OPEN">Ouverte</option>
              <option value="CLOSED">Fermée</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          </div>

          {/* Payment Status Filter */}
          <div className="relative w-full sm:w-[190px]">
            <select
              className="w-full h-10 appearance-none rounded-xl border border-input bg-background pl-3 pr-8 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring hover:border-accent-foreground/30 transition-colors cursor-pointer"
              value={paymentStatusFilter}
              onChange={(e) => onPaymentStatusFilterChange(e.target.value)}
            >
              <option value="">Tous statuts paiement</option>
              <option value="PAID">Payé</option>
              <option value="PARTIAL">Partiel</option>
              <option value="UNPAID">Non payé</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          </div>

          {/* Reset button matching the row's height and style */}
          {hasActiveFilters && onResetFilters && (
            <Button
              variant="outline"
              onClick={onResetFilters}
              className="h-10 px-4 rounded-xl text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium w-full sm:w-auto"
            >
              <RotateCcw size={15} />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
