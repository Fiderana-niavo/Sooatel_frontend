import React, { useState, useEffect, useCallback, useMemo, useLayoutEffect, useRef } from "react";
import { Input } from "@/components/ui/Inputs/input";
import { Button } from "@/components/ui/Button/button";
import { SearchableSelect } from "@/components/ui/Inputs/SearchableSelect";
import { SaleService } from "../../services/sale.service";
import { Loader2, TrendingUp, Calendar as CalendarIcon, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog/dialog";
import { InfiniteScroll } from "@/components/ui/Pagination/InfiniteScroll";

interface RevenueItem {
  idSale: string;
  saleDate: string;
  amount: number;
  paymentCode: string | null;
  invoiceNumber: string | null;
  tableNumber: number | null;
  chargeToRoom: boolean | null;
  roomNumber: string | null;
  paymentMethod: string;
  payments?: {
    idPayment: string;
    paymentDate: string;
    amount: number;
    paymentCode: string | null;
    paymentMethod: string | null;
    ref: string;
  }[];
}

interface RevenueGroup {
  date: string;
  totaldelajournee: number;
  liste: RevenueItem[];
}

export const RevenuePage: React.FC = () => {
  const [pagesData, setPagesData] = useState<Record<number, RevenueGroup[]>>({});
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingUp, setLoadingUp] = useState(false);
  const [loadingDown, setLoadingDown] = useState(false);

  const scrollAnchor = useRef<{ id: string, offset: number } | null>(null);

  const pageKeys = Object.keys(pagesData).map(Number);
  const minPage = pageKeys.length ? Math.min(...pageKeys) : 1;
  const maxPage = pageKeys.length ? Math.max(...pageKeys) : 1;

  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;
  const MAX_PAGES_IN_MEMORY = 3; // On garde 3 pages maximum (soit env 60 elements)

  const [filterDate, setFilterDate] = useState<string>("");
  const [filterMenuId, setFilterMenuId] = useState<string>("");
  const [menuOptions, setMenuOptions] = useState<{ value: string; label: string }[]>([]);

  const [selectedItem, setSelectedItem] = useState<RevenueItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [isNotJournalised, setIsNotJournalised] = useState(false);
  const [isJournalizing, setIsJournalizing] = useState(false);

  const [salerOptions, setSalerOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedProcessedBy, setSelectedProcessedBy] = useState<string>("");

  useEffect(() => {
    fetchMenus();
    fetchSalers();
  }, []);

  // Initial fetch or filter change
  useEffect(() => {
    fetchInitial();
  }, [filterDate, filterMenuId]);

  const fetchMenus = async () => {
    try {
      const res = await SaleService.getMenuItems();
      const opts = res.payload.map((m: any) => ({
        value: m.value,
        label: m.label
      }));
      setMenuOptions([{ value: "", label: "Tous les plats" }, ...opts]);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSalers = async () => {
    try {
      const res = await SaleService.getSalers();
      const salers = res.payload ?? res;
      const opts = (Array.isArray(salers) ? salers : []).map((s: any) => ({
        value: s.idEmployee ?? s.value,
        label: `${s.name ?? ""} ${s.lastname ?? ""}`.trim() || s.label
      }));
      setSalerOptions(opts);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPage = async (pageNum: number) => {
    const filters: any = {};
    if (filterDate) filters.date = filterDate;
    if (filterMenuId) filters.idMenu = filterMenuId;
    
    const res = await SaleService.getRevenue(pageNum, limit, filters);
    console.log(`[Revenus] Données récupérées pour la page ${pageNum}:`, res.payload.data);
    
    if (pageNum === 1) {
      setIsNotJournalised(res.payload.isNotJournalised);
    }
    
    return {
      data: res.payload.data as RevenueGroup[],
      totalPages: res.payload.totalPages || 1
    };
  };

  const fetchInitial = async () => {
    setInitialLoading(true);
    try {
      const res = await fetchPage(1);
      setPagesData({ 1: res.data });
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleLoadMoreBottom = useCallback(async () => {
    if (maxPage >= totalPages || loadingDown || initialLoading) return;
    setLoadingDown(true);
    try {
      const targetPage = maxPage + 1;
      const res = await fetchPage(targetPage);
      
      const rows = Array.from(document.querySelectorAll('tr[data-id]'));
      const firstVisible = rows.find(el => el.getBoundingClientRect().top >= 80); // 80px offset for header
      if (firstVisible) {
        scrollAnchor.current = {
          id: firstVisible.getAttribute('data-id')!,
          offset: firstVisible.getBoundingClientRect().top
        };
      }

      setPagesData(prev => {
        const newData = { ...prev, [targetPage]: res.data };
        const keys = Object.keys(newData).map(Number).sort((a, b) => a - b);
        if (keys.length > MAX_PAGES_IN_MEMORY) {
          delete newData[keys[0]]; // Remove oldest (top) page
        }
        return newData;
      });
      
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDown(false);
    }
  }, [maxPage, totalPages, loadingDown, initialLoading, filterDate, filterMenuId]);

  const handleLoadMoreTop = useCallback(async () => {
    if (minPage <= 1 || loadingUp || initialLoading) return;
    setLoadingUp(true);
    try {
      const targetPage = minPage - 1;
      const res = await fetchPage(targetPage);
      
      const rows = Array.from(document.querySelectorAll('tr[data-id]'));
      const firstVisible = rows.find(el => el.getBoundingClientRect().top >= 80);
      if (firstVisible) {
        scrollAnchor.current = {
          id: firstVisible.getAttribute('data-id')!,
          offset: firstVisible.getBoundingClientRect().top
        };
      }

      setPagesData(prev => {
        const newData = { ...prev, [targetPage]: res.data };
        const keys = Object.keys(newData).map(Number).sort((a, b) => a - b);
        if (keys.length > MAX_PAGES_IN_MEMORY) {
          delete newData[keys[keys.length - 1]]; // Remove newest (bottom) page
        }
        return newData;
      });
      
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUp(false);
    }
  }, [minPage, loadingUp, initialLoading, filterDate, filterMenuId]);

  const loadPaymentDetails = (item: RevenueItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleJournalize = async () => {
    try {
      setIsJournalizing(true);
      await SaleService.journalizeSales(selectedProcessedBy || undefined);
      setIsNotJournalised(false);
      setPagesData({});
      fetchInitial();
    } catch (e) {
      console.error(e);
    } finally {
      setIsJournalizing(false);
    }
  };

  // Fusionner toutes les pages présentes dans pagesData pour affichage
  const data = useMemo(() => {
    const map = new Map<string, RevenueGroup>();
    const keys = Object.keys(pagesData).map(Number).sort((a, b) => a - b);
    
    keys.forEach(k => {
      const groups = pagesData[k];
      if (!groups || !Array.isArray(groups)) return;
      
      groups.forEach(g => {
        if (!g || !g.date || !g.liste) return;
        if (map.has(g.date)) {
          const existingG = map.get(g.date)!;
          existingG.liste = [...existingG.liste, ...g.liste];
        } else {
          map.set(g.date, { ...g, liste: [...g.liste] });
        }
      });
    });
    
    return Array.from(map.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [pagesData]);

  useLayoutEffect(() => {
    try {
      if (scrollAnchor.current) {
        const escapedId = scrollAnchor.current.id.replace(/"/g, '\\"');
        const el = document.querySelector(`tr[data-id="${escapedId}"]`);
        if (el) {
          const currentOffset = el.getBoundingClientRect().top;
          const diff = currentOffset - scrollAnchor.current.offset;
          if (Math.abs(diff) > 2) {
            window.scrollBy(0, diff);
          }
        }
        scrollAnchor.current = null;
      }
    } catch (e) {
      console.error("Scroll anchor error:", e);
      scrollAnchor.current = null;
    }
  }, [data]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row gap-4 items-end bg-card p-4 rounded-xl shadow-sm border border-border/50 shrink-0">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Filtrer par date</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Filtrer par plat</label>
          <SearchableSelect
            options={menuOptions}
            value={filterMenuId}
            onChange={(val) => setFilterMenuId(String(val))}
            placeholder="Sélectionner un plat..."
          />
        </div>
        
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Filtrer par fournisseur (ID)</label>
          <Input 
            placeholder="ID Fournisseur"
            disabled
          />
        </div>
        
        <div>
          <Button onClick={() => { setFilterDate(""); setFilterMenuId(""); }} variant="outline">
            Effacer
          </Button>
        </div>
        {isNotJournalised && (
          <div className="flex items-end gap-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Traité par</label>
              <SearchableSelect
                options={salerOptions}
                value={selectedProcessedBy}
                onChange={(val) => setSelectedProcessedBy(String(val))}
                placeholder="Utilisateur courant"
              />
            </div>
            <Button onClick={handleJournalize} disabled={isJournalizing}>
              {isJournalizing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Journaliser les ventes
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 bg-transparent rounded-xl">
        {initialLoading ? (
          <div className="flex justify-center items-center h-64 bg-card rounded-xl border border-border/50">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-card rounded-xl border border-border/50">
            <TrendingUp className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-muted-foreground">Aucune recette trouvée</h3>
            <p className="text-sm text-muted-foreground">Modifiez vos filtres ou vérifiez les dates.</p>
          </div>
        ) : (
          <InfiniteScroll
            onLoadMoreTop={handleLoadMoreTop}
            onLoadMoreBottom={handleLoadMoreBottom}
            hasMoreTop={minPage > 1}
            hasMoreBottom={maxPage < totalPages}
            isLoadingTop={loadingUp}
            isLoadingBottom={loadingDown}
          >
            <div className="bg-card rounded-xl border border-border/50 shadow-sm mb-8">
              <table className="w-full text-sm text-left relative">
                <thead className="text-xs text-primary-foreground uppercase bg-primary shadow-sm">
                    <tr>
                      <th className="sticky top-0 z-20 bg-primary px-6 py-3 border-b border-primary/20">N° Facture</th>
                      <th className="sticky top-0 z-20 bg-primary px-6 py-3 border-b border-primary/20">Emplacement</th>
                      <th className="sticky top-0 z-20 bg-primary px-6 py-3 border-b border-primary/20">Code Paiement</th>
                      <th className="sticky top-0 z-20 bg-primary px-6 py-3 border-b border-primary/20">Méthode</th>
                      <th className="sticky top-0 z-20 bg-primary px-6 py-3 border-b border-primary/20 text-right">Montant</th>
                      <th className="sticky top-0 z-20 bg-primary px-6 py-3 border-b border-primary/20 text-right">Actions</th>
                    </tr>
                  </thead>
                  {data.map((group) => (
                    <tbody key={group.date} className="divide-y divide-border/50">
                      <tr className="bg-primary/5 hover:bg-primary/5 transition-colors border-t-2 border-border/50">
                        <td colSpan={4} className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <CalendarIcon className="w-5 h-5 text-primary" />
                            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                              {new Date(group.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                            </h3>
                          </div>
                        </td>
                        <td colSpan={2} className="px-6 py-3 text-right">
                          <span className="text-xs font-semibold text-muted-foreground uppercase mr-2 tracking-wider">Total :</span>
                          <span className="font-bold text-sm text-primary">{group.totaldelajournee.toLocaleString("fr-FR")} Ar</span>
                        </td>
                      </tr>
                      {group.liste.map((item) => (
                        <tr key={item.idSale} data-id={item.idSale} className="hover:bg-secondary/10 transition-colors bg-card">
                          <td className="px-6 py-4 font-medium">{item.invoiceNumber || "—"}</td>
                          <td className="px-6 py-4">
                            {item.chargeToRoom ? (
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                Chambre {item.roomNumber || "—"}
                              </span>
                            ) : (
                              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                Table {item.tableNumber || "—"}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs">{item.paymentCode || "—"}</td>
                          <td className="px-6 py-4">{item.paymentMethod || "—"}</td>
                          <td className="px-6 py-4 text-right font-semibold">{item.amount.toLocaleString("fr-FR")} Ar</td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="sm" onClick={() => loadPaymentDetails(item)}>
                              <Search className="w-4 h-4 mr-1" /> Détails
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  ))}
                </table>
            </div>
          </InfiniteScroll>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails des paiements</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedItem?.payments && selectedItem.payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border rounded-lg overflow-hidden">
                  <thead className="bg-muted text-muted-foreground uppercase text-xs">
                    <tr>
                      <th className="px-4 py-2 border-b">Référence</th>
                      <th className="px-4 py-2 border-b">Date</th>
                      <th className="px-4 py-2 border-b">Méthode</th>
                      <th className="px-4 py-2 border-b">Code</th>
                      <th className="px-4 py-2 border-b text-right">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedItem.payments.map((p) => (
                      <tr key={p.idPayment} className="hover:bg-muted/50">
                        <td className="px-4 py-3 font-mono text-xs">{p.ref}</td>
                        <td className="px-4 py-3">
                          {new Date(p.paymentDate).toLocaleString("fr-FR", {
                            day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </td>
                        <td className="px-4 py-3">{p.paymentMethod || "—"}</td>
                        <td className="px-4 py-3 font-mono text-xs">{p.paymentCode || "—"}</td>
                        <td className="px-4 py-3 text-right font-semibold">{p.amount.toLocaleString("fr-FR")} Ar</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Aucun paiement trouvé pour cette vente.</p>
            )}
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setDialogOpen(false)}>Fermer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

