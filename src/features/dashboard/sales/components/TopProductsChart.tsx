import React, { useEffect, useRef } from "react";
import {
  Chart,
  BarController,
  BarElement,
  LinearScale,
  CategoryScale,
  Tooltip,
} from "chart.js";
import type { TopProduct, Metric } from "../types/dashboard";
import { Loader2 } from "lucide-react";

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip);

interface Props {
  products: TopProduct[];
  metric: Metric;
  loading: boolean;
  onProductClick: (idMenu: string) => void;
}

const COLORS = [
  "rgba(99, 102, 241, 0.85)",
  "rgba(16, 185, 129, 0.85)",
  "rgba(245, 158, 11, 0.85)",
  "rgba(239, 68, 68, 0.85)",
  "rgba(59, 130, 246, 0.85)",
];

export const TopProductsChart: React.FC<Props> = ({
  products,
  metric,
  loading,
  onProductClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || loading) return;

    chartRef.current?.destroy();
    chartRef.current = null;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: products.map((p) => p.name),
        datasets: [
          {
            label: metric === "ca" ? "Chiffre d'affaires (Ar)" : "Bénéfice (Ar)",
            data: products.map((p) => p.value),
            backgroundColor: COLORS,
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        onClick: (_e, elements) => {
          if (elements.length > 0) {
            const idx = elements[0].index;
            onProductClick(products[idx].idMenu);
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                ` ${Number(ctx.raw).toLocaleString("fr-FR")} Ar`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(0,0,0,0.04)" },
            ticks: {
              font: { size: 11 },
              callback: (v) => `${Number(v).toLocaleString("fr-FR")}`,
            },
          },
          y: {
            grid: { display: false },
            ticks: { font: { size: 12, weight: "bold" } },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [products, metric, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-52">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-52 text-muted-foreground text-sm">
        Aucun produit trouvé
      </div>
    );
  }

  return (
    <div className="relative h-52 w-full">
      <canvas ref={canvasRef} />
    </div>
  );
};
