import React, { useEffect, useRef } from "react";
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { TopProduct, Metric } from "../types/dashboard";
import { Loader2 } from "lucide-react";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

interface Props {
  products: TopProduct[];
  metric: Metric;
  loading: boolean;
  selectedIdMenu: string | null;
  onProductClick: (idMenu: string) => void;
}

const COLORS = [
  "rgba(99, 102, 241, 0.9)",
  "rgba(16, 185, 129, 0.9)",
  "rgba(245, 158, 11, 0.9)",
  "rgba(239, 68, 68, 0.9)",
  "rgba(59, 130, 246, 0.9)",
];

export const TopProductsDonut: React.FC<Props> = ({
  products,
  metric,
  loading,
  selectedIdMenu,
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
      type: "doughnut",
      data: {
        labels: products.map((p) => p.name),
        datasets: [
          {
            data: products.map((p) => p.percentage),
            backgroundColor: COLORS,
            borderColor: "transparent",
            borderWidth: 0,
            hoverOffset: 4,
            offset: products.map((p) => 
              p.idMenu === selectedIdMenu ? 6 : 0
            ),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        onClick: (_e, elements) => {
          if (elements.length > 0) {
            const idx = elements[0].index;
            onProductClick(products[idx].idMenu);
          }
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: { font: { size: 11 }, padding: 12, boxWidth: 12 },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const pct = ctx.raw as number;
                const product = products[ctx.dataIndex];
                return [
                  ` ${pct}% du total`,
                  ` ${product.value.toLocaleString("fr-FR")} Ar`,
                ];
              },
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [products, metric, loading, selectedIdMenu]);

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
