import React from "react";
import type { Metric } from "../types/dashboard";
import { CalendarRange, TrendingUp, PiggyBank } from "lucide-react";

interface Props {
  startDate: string;
  endDate: string;
  metric: Metric;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onMetricChange: (v: Metric) => void;
}

export const DashboardFilter: React.FC<Props> = ({
  startDate,
  endDate,
  metric,
  onStartDateChange,
  onEndDateChange,
  onMetricChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-end">
      {/* Metric tabs */}
      <div className="flex bg-secondary/10 rounded-xl p-1 gap-1 shrink-0">
        <button
          onClick={() => onMetricChange("ca")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            metric === "ca"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Chiffre d'Affaires
        </button>
        <button
          onClick={() => onMetricChange("benefit")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            metric === "benefit"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <PiggyBank className="w-4 h-4" />
          Bénéfice
        </button>
      </div>

      {/* Date range */}
      <div className="flex flex-1 gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Date de début
          </label>
          <div className="relative">
            <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Date de fin
          </label>
          <div className="relative">
            <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
