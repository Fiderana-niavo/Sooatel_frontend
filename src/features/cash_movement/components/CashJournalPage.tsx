import { useState, useEffect, useRef, useCallback } from "react";
import {
  BookOpen, ChevronDown, ChevronRight, Lock, Unlock, Plus,
  TrendingUp, TrendingDown, AlertTriangle, ArrowUpCircle, ArrowDownCircle, Loader2
} from "lucide-react";
import { CashJournalService } from "../services/cash-journal.service";
import type { CashJournal, CashMovement } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import type { SnackbarType } from "@/components/ui/Snackbar/snackbar";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-MG", { style: "currency", currency: "MGA", maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

// ─── Journal Movement Row ──────────────────────────────────────────────────────
function MovementRow({ mv }: { mv: CashMovement }) {
  const isIn = mv.direction > 0;
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
      <div className={`p-2 rounded-full ${isIn ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
        {isIn ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{mv.reason || mv.cashMovementCategory?.label || mv.ref}</p>
        <p className="text-xs text-muted-foreground">
          {mv.paymentMethod?.label || "—"} · {mv.movementDate ? fmtDate(String(mv.movementDate)) : "—"}
        </p>
      </div>
      <span className={`text-sm font-semibold ${isIn ? "text-emerald-500" : "text-red-500"}`}>
        {isIn ? "+" : "-"}{fmt(Number(mv.amount))}
      </span>
    </div>
  );
}

// ─── Journal Movements Panel (infinite scroll) ─────────────────────────────────
function JournalMovements({ idJournal }: { idJournal: string }) {
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const observerRef = useRef<HTMLDivElement>(null);

  const loadPage = useCallback(async (p: number) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const result = await CashJournalService.getMovements(idJournal, { page: p, limit: 5 });
      setMovements(prev => p === 1 ? result.records : [...prev, ...result.records]);
      setHasMore(p * 5 < result.total);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [idJournal]);

  useEffect(() => { loadPage(1); }, [loadPage]);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const scrollContainer = el.closest('.overflow-y-auto');
    const obs = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting && hasMore && !loading) {
        const next = page + 1;
        setPage(next);
        loadPage(next);
      }
    }, { root: scrollContainer, threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, page, loadPage, loading]);

  if (movements.length === 0 && !loading) {
    return <p className="text-sm text-muted-foreground text-center py-6">Aucun mouvement pour ce journal.</p>;
  }

  return (
    <div className="divide-y divide-border/30 max-h-[300px] overflow-y-auto">
      {movements.map(mv => <MovementRow key={mv.idCashMovement} mv={mv} />)}
      <div ref={observerRef} className="py-2 flex justify-center">
        {loading && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
      </div>
    </div>
  );
}

// ─── Journal Card ───────────────────────────────────────────────────────────────
function JournalCard({
  journal, expanded, onToggle, onClose
}: {
  journal: CashJournal;
  expanded: boolean;
  onToggle: () => void;
  onClose: (j: CashJournal) => void;
}) {
  const isOpen = !journal.journalClosing;
  const rawDiscrepancy = journal.cashDiscrepancy ?? null;
  const discrepancy = rawDiscrepancy !== null ? Number(rawDiscrepancy) : null;

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden
      ${isOpen ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-card"}`}>
      {/* Header row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/20 transition-colors"
      >
        <div className={`p-2 rounded-full ${isOpen ? "bg-emerald-500/15 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
          {isOpen ? <Unlock size={15} /> : <Lock size={15} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">{journal.ref}</span>
            {isOpen && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 uppercase tracking-wide">
                Actif
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ouvert le {fmtDate(journal.journalOpening)}
            {journal.journalClosing && ` · Fermé le ${fmtDate(journal.journalClosing)}`}
          </p>
        </div>
        {!isOpen && (
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Solde</p>
            <p className="text-sm font-bold text-foreground">{fmt(journal.expectedClosingBalance)}</p>
          </div>
        )}
        {!isOpen && discrepancy !== null && discrepancy !== 0 && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
            ${discrepancy > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
            {discrepancy > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {fmt(Math.abs(discrepancy))}
          </div>
        )}
        {isOpen && (
          <Button
            variant="destructive"
            size="sm"
            className="text-xs"
            onClick={e => { e.stopPropagation(); onClose(journal); }}
          >
            Fermer
          </Button>
        )}
        {expanded ? <ChevronDown size={16} className="text-muted-foreground shrink-0" /> : <ChevronRight size={16} className="text-muted-foreground shrink-0" />}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border/50">
          {/* Payment method balances */}
          {journal.paymentMethodBalances && journal.paymentMethodBalances.length > 0 && (
            <div className="px-5 py-3 flex flex-wrap gap-3 border-b border-border/30 bg-muted/10">
              {journal.paymentMethodBalances.map(b => (
                <div key={b.idPaymentMethodBalance} className="flex items-center gap-2 text-xs bg-background px-3 py-2 rounded-lg border border-border/50">
                  <span className="text-muted-foreground">{b.paymentMethod?.label ?? "—"}</span>
                  <span className="font-semibold text-foreground">{fmt(Number(b.amount))}</span>
                </div>
              ))}
            </div>
          )}
          {/* Movements */}
          <JournalMovements idJournal={journal.idJournal} />
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export function CashJournalPage() {
  const [journals, setJournals] = useState<CashJournal[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [openDialogOpen, setOpenDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [journalToClose, setJournalToClose] = useState<CashJournal | null>(null);

  const [actualBalance, setActualBalance] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const [snackbar, setSnackbar] = useState<{ message: string; type: SnackbarType; isOpen: boolean }>(
    { message: "", type: "info", isOpen: false }
  );
  const observerRef = useRef<HTMLDivElement>(null);

  const activeJournal = journals.find(j => !j.journalClosing);

  const showSnack = (message: string, type: SnackbarType = "info") =>
    setSnackbar({ message, type, isOpen: true });

  const loadPage = useCallback(async (p: number) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const result = await CashJournalService.getAll({ page: p, limit: 10 });
      const list = result.records;
      setJournals(prev => p === 1 ? list : [...prev, ...list]);
      setHasMore(p * 10 < result.total);
      // Auto-expand the first (most recent) journal on initial load
      if (p === 1 && list.length > 0) {
        setExpandedId(list[0]!.idJournal);
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPage(1); }, [loadPage]);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting && hasMore && !loading) {
        const next = page + 1;
        setPage(next);
        loadPage(next);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, page, loadPage, loading]);

  const handleToggle = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleOpenJournal = async () => {
    setSubmitting(true);
    try {
      await CashJournalService.openJournal(""); // empty ref to trigger auto-generation
      setOpenDialogOpen(false);
      showSnack("Journal ouvert avec succès.", "success");
      setPage(1);
      await loadPage(1);
    } catch (e: any) {
      showSnack(e.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseJournal = async () => {
    if (!journalToClose) return;
    const balance = parseFloat(actualBalance);
    if (isNaN(balance)) { showSnack("Veuillez saisir un solde réel valide.", "error"); return; }
    setSubmitting(true);
    try {
      await CashJournalService.closeJournal(journalToClose.idJournal, balance);
      setCloseDialogOpen(false);
      setActualBalance("");
      setJournalToClose(null);
      showSnack("Journal fermé avec succès.", "success");
      setPage(1);
      await loadPage(1);
    } catch (e: any) {
      showSnack(e.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-primary" />
          <h2 className="text-lg font-bold text-foreground">Journaux de Caisse</h2>
        </div>
        {!activeJournal && (
          <Button size="sm" onClick={() => setOpenDialogOpen(true)}>
            <Plus size={14} className="mr-1" />
            Ouvrir un journal
          </Button>
        )}
        {activeJournal && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Journal actif : {activeJournal.ref}
          </div>
        )}
      </div>

      {/* Journal list */}
      <div className="flex flex-col gap-3 overflow-auto flex-1 pb-4">
        {journals.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <BookOpen size={40} className="opacity-30" />
            <p className="text-sm">Aucun journal de caisse trouvé.</p>
          </div>
        )}

        {journals.map(j => (
          <JournalCard
            key={j.idJournal}
            journal={j}
            expanded={expandedId === j.idJournal}
            onToggle={() => handleToggle(j.idJournal)}
            onClose={j => { setJournalToClose(j); setActualBalance(""); setCloseDialogOpen(true); }}
          />
        ))}

        {/* Infinite scroll sentinel */}
        <div ref={observerRef} className="flex justify-center py-2">
          {loading && <Loader2 size={18} className="animate-spin text-muted-foreground" />}
        </div>
      </div>

      {/* Open journal dialog */}
      <Dialog open={openDialogOpen} onOpenChange={setOpenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ouvrir un nouveau journal de caisse</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <p className="text-sm text-muted-foreground text-center">
              La référence du journal sera générée automatiquement.
              Êtes-vous sûr de vouloir ouvrir un nouveau journal de caisse ?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleOpenJournal} disabled={submitting}>
              {submitting ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              Ouvrir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close journal dialog */}
      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fermer le journal {journalToClose?.ref}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-700">Solde attendu</p>
                <p className="text-lg font-bold text-foreground">
                  {fmt(journalToClose?.expectedClosingBalance ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Veuillez compter physiquement la caisse et saisir le solde réel ci-dessous.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">Solde réel constaté (MGA)</label>
              <Input
                type="number"
                placeholder="0"
                value={actualBalance}
                onChange={e => setActualBalance(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseDialogOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleCloseJournal} disabled={submitting}>
              {submitting ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              Confirmer la fermeture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {snackbar.isOpen && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar(s => ({ ...s, isOpen: false }))}
        />
      )}
    </div>
  );
}
