import React from "react";
import type { Metric } from "../types/dashboard";
import { TrendingUp, PiggyBank, Loader2 } from "lucide-react";

interface Props {
  total: number;
  metric: Metric;
  loading: boolean;
  startDate: string;
  endDate: string;
}

const formatAmount = (n: number) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export const SummaryCards: React.FC<Props> = ({ total, metric, loading, startDate, endDate }) => {
  const isCA = metric === "ca";
  const Icon = isCA ? TrendingUp : PiggyBank;
  const label = isCA ? "Chiffre d'affaires" : "Bénéfice Net";
  const colorClass = isCA ? "text-primary bg-primary/10" : "text-emerald-500 bg-emerald-500/10";
  const valueClass = isCA ? "text-primary" : "text-emerald-500";

  const fmt = (d: string) =>
    new Date(`${d}T00:00:00`).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Main metric card */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex items-center gap-5">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            {label} total
          </p>
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          ) : (
            <p className={`text-3xl font-extrabold tracking-tight ${valueClass}`}>
              {formatAmount(total)}{" "}
              <span className="text-base font-semibold text-muted-foreground">Ar</span>
            </p>
          )}
        </div>
      </div>

      {/* Period card */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex items-center gap-5">
        <div className="p-3 rounded-xl text-secondary bg-secondary/10">
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Période analysée
          </p>
          <p className="text-base font-bold text-foreground">
            {fmt(startDate)} → {fmt(endDate)}
          </p>
        </div>
      </div>
    </div>
  );
};
