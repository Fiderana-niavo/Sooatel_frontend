import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { SearchableSelect } from "@/components/ui/Inputs/SearchableSelect";
import { SaleService } from "../../services/sale.service";
import { Loader2, TrendingUp, Calendar as CalendarIcon, Search } from "lucide-react";
import Pagination from "@/components/ui/Pagination/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog/dialog";

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
  const [data, setData] = useState<RevenueGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const [filterDate, setFilterDate] = useState<string>("");
  const [filterMenuId, setFilterMenuId] = useState<string>("");
  const [menuOptions, setMenuOptions] = useState<{ value: string; label: string }[]>([]);

  // Modal for payment details
  const [selectedItem, setSelectedItem] = useState<RevenueItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchMenus();
  }, []);

  useEffect(() => {
    fetchRevenue();
  }, [page, filterDate, filterMenuId]);

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

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (filterDate) filters.date = filterDate;
      if (filterMenuId) filters.idMenu = filterMenuId;
      
      const res = await SaleService.getRevenue(page, limit, filters);
      setData(res.payload.data);
      setTotalPages(res.payload.totalPages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentDetails = (item: RevenueItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end bg-card p-4 rounded-xl shadow-sm border border-border/50">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Filtrer par date</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Filtrer par plat</label>
          <SearchableSelect
            options={menuOptions}
            value={filterMenuId}
            onChange={(val) => { setFilterMenuId(String(val)); setPage(1); }}
            placeholder="Sélectionner un plat..."
          />
        </div>
        
        {/* Supplier filter placeholder for when the endpoint is ready */}
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Filtrer par fournisseur (ID)</label>
          <Input 
            placeholder="ID Fournisseur"
            disabled
          />
        </div>
        
        <div>
          <Button onClick={() => { setFilterDate(""); setFilterMenuId(""); setPage(1); }} variant="outline">
            Effacer
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-card rounded-xl border border-border/50">
          <TrendingUp className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-lg font-medium text-muted-foreground">Aucune recette trouvée</h3>
          <p className="text-sm text-muted-foreground">Modifiez vos filtres ou vérifiez les dates.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {data.map((group) => (
            <div key={group.date} className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-primary/5 px-6 py-4 border-b border-border/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">
                      {new Date(group.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </h3>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total de la journée</p>
                  <p className="font-bold text-xl text-primary">{group.totaldelajournee.toLocaleString("fr-FR")} Ar</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-secondary/5 border-b border-border/50">
                    <tr>
                      <th className="px-6 py-3">N° Facture</th>
                      <th className="px-6 py-3">Emplacement</th>
                      <th className="px-6 py-3">Code Paiement</th>
                      <th className="px-6 py-3">Méthode</th>
                      <th className="px-6 py-3 text-right">Montant</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {group.liste.map((item) => (
                      <tr key={item.idSale} className="hover:bg-secondary/5 transition-colors">
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
                </table>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

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
