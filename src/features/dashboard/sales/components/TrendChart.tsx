import React, { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import type { ChartPoint, Metric } from "../types/dashboard";
import { Loader2 } from "lucide-react";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
  Legend
);

interface Props {
  data: ChartPoint[];
  metric: Metric;
  loading: boolean;
}

export const TrendChart: React.FC<Props> = ({ data, metric, loading }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const isCA = metric === "ca";
  const color = isCA ? "rgba(99, 102, 241, 1)" : "rgba(16, 185, 129, 1)";
  const colorFill = isCA ? "rgba(99, 102, 241, 0.12)" : "rgba(16, 185, 129, 0.12)";
  const label = isCA ? "Chiffre d'affaires (Ar)" : "Bénéfice (Ar)";

  useEffect(() => {
    if (!canvasRef.current || loading) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            label,
            data: data.map((d) => d.value),
            borderColor: color,
            backgroundColor: colorFill,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointBackgroundColor: color,
            borderWidth: 2.5,
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
              label: (ctx) =>
                ` ${Number(ctx.raw).toLocaleString("fr-FR")} Ar`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(0,0,0,0.04)" },
            ticks: { font: { size: 11 } },
          },
          y: {
            grid: { color: "rgba(0,0,0,0.04)" },
            ticks: {
              font: { size: 11 },
              callback: (v) =>
                `${Number(v).toLocaleString("fr-FR")}`,
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data, metric, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p className="text-sm">Aucune donnée pour cette période</p>
      </div>
    );
  }

  return (
    <div className="relative h-64 w-full">
      <canvas ref={canvasRef} />
    </div>
  );
};
