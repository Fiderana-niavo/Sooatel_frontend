import React, { useState, useEffect, useCallback } from "react";
import type { Metric, DashboardSummary, TopProductsResult, ProductDetail } from "../types/dashboard";
import { CaDashboardService, BenefitDashboardService } from "../services/dashboard.service";
import { DashboardFilter } from "./DashboardFilter";
import { SummaryCards } from "./SummaryCards";
import { TrendChart } from "./TrendChart";
import { TopProductsChart } from "./TopProductsChart";
import { TopProductsDonut } from "./TopProductsDonut";
import { ProductDetailSection } from "./ProductDetailSection";
import { SaleService } from "../../../sales/services/sale.service";

// ── Default period: previous month ────────────────────────────────────────────
const getDefaultDates = (): { start: string; end: string } => {
  const end = new Date();
  const start = new Date(end);
  start.setMonth(start.getMonth() - 1);
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  return { start: fmt(start), end: fmt(end) };
};

export const DashboardPage: React.FC = () => {
  const defaults = getDefaultDates();

  const [metric, setMetric] = useState<Metric>("ca");
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductsResult | null>(null);
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);
  const [allProducts, setAllProducts] = useState<{ value: string; label: string }[]>([]);

  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingTop, setLoadingTop] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [selectedIdMenu, setSelectedIdMenu] = useState<string | null>(null);

  // Sélectionner le bon service selon l'onglet actif
  const service = metric === "ca" ? CaDashboardService : BenefitDashboardService;

  // ── Fetch summary ──────────────────────────────────────────────────────────
  const fetchSummary = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoadingSummary(true);
    try {
      const result = await service.getSummary(startDate, endDate);
      setSummary(result);
    } catch (e) {
      console.error("[DashboardPage] fetchSummary error", e);
      setSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  }, [startDate, endDate, metric]);

  // ── Fetch top products ─────────────────────────────────────────────────────
  const fetchTopProducts = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoadingTop(true);
    try {
      const result = await service.getTopProducts(startDate, endDate);
      setTopProducts(result);
      if (result.top5.length > 0 && !selectedIdMenu) {
        setSelectedIdMenu(result.top5[0].idMenu);
      }
    } catch (e) {
      console.error("[DashboardPage] fetchTopProducts error", e);
      setTopProducts(null);
    } finally {
      setLoadingTop(false);
    }
  }, [startDate, endDate, metric]);

  // ── Fetch product detail ───────────────────────────────────────────────────
  const fetchProductDetail = useCallback(async (idMenu: string) => {
    if (!startDate || !endDate) return;
    setLoadingDetail(true);
    try {
      const result = await service.getProductDetail(idMenu, startDate, endDate);
      setProductDetail(result);
    } catch (e) {
      console.error("[DashboardPage] fetchProductDetail error", e);
      setProductDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }, [startDate, endDate, metric]);

  useEffect(() => {
    SaleService.getMenuItems()
      .then((res) => {
        if (res && res.payload) {
          setAllProducts(res.payload);
        }
      })
      .catch((err) => console.error("Failed to load products for dashboard", err));
  }, []);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    setSelectedIdMenu(null);
    setProductDetail(null);
    fetchSummary();
    fetchTopProducts();
  }, [startDate, endDate, metric]);

  useEffect(() => {
    if (selectedIdMenu) fetchProductDetail(selectedIdMenu);
  }, [selectedIdMenu, startDate, endDate, metric]);

  useEffect(() => {
    if (topProducts && topProducts.top5.length > 0 && !selectedIdMenu) {
      setSelectedIdMenu(topProducts.top5[0].idMenu);
    }
  }, [topProducts]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
        <DashboardFilter
          startDate={startDate}
          endDate={endDate}
          metric={metric}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onMetricChange={(m) => {
            setMetric(m);
            setSelectedIdMenu(null);
            setProductDetail(null);
          }}
        />
      </div>

      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      <SummaryCards
        total={summary?.total ?? 0}
        metric={metric}
        loading={loadingSummary}
        startDate={startDate}
        endDate={endDate}
      />

      {/* ── Trend chart ──────────────────────────────────────────────────── */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          {metric === "ca" ? "Évolution du Chiffre d'affaires" : "Évolution du Bénéfice"} sur la période
        </p>
        <TrendChart
          data={summary?.chartData ?? []}
          metric={metric}
          loading={loadingSummary}
        />
      </div>

      {/* ── Top 5 products ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Top 5 produits — {metric === "ca" ? "Chiffre d'affaires" : "Bénéfice"}
          </p>
          <TopProductsChart
            products={topProducts?.top5 ?? []}
            metric={metric}
            loading={loadingTop}
            onProductClick={setSelectedIdMenu}
          />
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Répartition — % du total
          </p>
          <TopProductsDonut
            products={topProducts?.top5 ?? []}
            metric={metric}
            loading={loadingTop}
            selectedIdMenu={selectedIdMenu}
            onProductClick={setSelectedIdMenu}
          />
        </div>
      </div>

      {/* ── Product detail ───────────────────────────────────────────────── */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Détail produit
          </p>
          <div className="w-full sm:w-64">
            <select
              value={selectedIdMenu || ""}
              onChange={(e) => setSelectedIdMenu(e.target.value)}
              className="w-full text-sm rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary transition-colors"
            >
              <option value="" disabled>Sélectionner un produit...</option>
              {allProducts.map((p: any) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <ProductDetailSection
          detail={productDetail}
          metric={metric}
          loading={loadingDetail}
        />
      </div>
    </div>
  );
};
