import React, { useEffect, useRef } from "react";
import {
  Chart,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import type { ProductDetail, Metric } from "../types/dashboard";
import { Loader2, Star } from "lucide-react";

Chart.register(
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

interface Props {
  detail: ProductDetail | null;
  metric: Metric;
  loading: boolean;
}

export const ProductDetailSection: React.FC<Props> = ({ detail, metric, loading }) => {
  const barCanvasRef = useRef<HTMLCanvasElement>(null);
  const donutCanvasRef = useRef<HTMLCanvasElement>(null);
  const barChartRef = useRef<Chart | null>(null);
  const donutChartRef = useRef<Chart | null>(null);

  const isCA = metric === "ca";
  const mainColor = isCA ? "rgba(99, 102, 241, 0.85)" : "rgba(16, 185, 129, 0.85)";
  const restColor = "rgba(200, 200, 200, 0.5)";

  // ── Bar chart (product over time) ──────────────────────────────────────────
  useEffect(() => {
    if (!barCanvasRef.current || loading || !detail) return;

    barChartRef.current?.destroy();
    barChartRef.current = null;

    const ctx = barCanvasRef.current.getContext("2d");
    if (!ctx) return;

    barChartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: detail.chartData.map((d) => d.label),
        datasets: [
          {
            label: isCA ? "Chiffre d'affaires (Ar)" : "Bénéfice (Ar)",
            data: detail.chartData.map((d) => d.value),
            backgroundColor: mainColor,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${Number(ctx.raw).toLocaleString("fr-FR")} Ar`,
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: {
            grid: { color: "rgba(0,0,0,0.04)" },
            ticks: {
              font: { size: 10 },
              callback: (v) => `${Number(v).toLocaleString("fr-FR")}`,
            },
          },
        },
      },
    });

    return () => {
      barChartRef.current?.destroy();
      barChartRef.current = null;
    };
  }, [detail, metric, loading]);

  // ── Donut chart (product vs rest) ──────────────────────────────────────────
  useEffect(() => {
    if (!donutCanvasRef.current || loading || !detail) return;

    donutChartRef.current?.destroy();
    donutChartRef.current = null;

    const ctx = donutCanvasRef.current.getContext("2d");
    if (!ctx) return;

    const rest = 100 - detail.percentage;

    donutChartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [detail.name, "Autres produits"],
        datasets: [
          {
            data: [detail.percentage, rest > 0 ? rest : 0],
            backgroundColor: [mainColor, restColor],
            borderColor: ["transparent", "transparent"],
            borderWidth: 0,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.raw}%`,
            },
          },
        },
      },
    });

    return () => {
      donutChartRef.current?.destroy();
      donutChartRef.current = null;
    };
  }, [detail, metric, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="space-y-4">
      {/* Product name + stats */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          <h3 className="text-lg font-bold text-foreground">{detail.name}</h3>
        </div>
        <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
          {detail.value.toLocaleString("fr-FR")} Ar
        </span>
        <span className="bg-secondary/10 text-secondary text-xs font-semibold px-3 py-1 rounded-full">
          {detail.percentage}% du total
        </span>
      </div>

      {/* Two charts side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donut — share vs others */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Part dans le total
          </p>
          {/* Donut with center label */}
          <div className="relative h-44 w-full">
            <canvas ref={donutCanvasRef} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-foreground">
                {detail.percentage}%
              </span>
              <span className="text-xs text-muted-foreground">du total</span>
            </div>
          </div>
        </div>

        {/* Bar — evolution over period */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Évolution sur la période
          </p>
          <div className="relative h-44 w-full">
            <canvas ref={barCanvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
};
