import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Settings2 } from "lucide-react";
import { leaveService } from "../../services/leave.service";
import type { LeaveType } from "../../types/leave.type";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { DEDUCTION_MODE_LABELS, CAP_PERIOD_LABELS } from "../../constants/leave.constants";

type LeaveTypeForm = Omit<LeaveType, "idLeaveType" | "isActive">;

const EMPTY_FORM: LeaveTypeForm = {
  label: "",
  isPaid: true,
  requiresProof: false,
  deductionMode: "NEVER",
  cap: null,
  capPeriod: null,
};

// ============================================================================
// COMPONENT: LeaveTypesPage
// ============================================================================
export function LeaveTypesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<LeaveTypeForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const typesQuery = useQuery({
    queryKey: ["leave-types"],
    queryFn: leaveService.getLeaveTypes,
  });

  const leaveTypes = typesQuery.data ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["leave-types"] });

  const createMutation = useMutation({
    mutationFn: () => leaveService.createLeaveType(form),
    onSuccess: () => { invalidate(); closeForm(); setSnackbar({ message: "Type de congé créé avec succès.", type: "success" }); },
    onError: (err: unknown) => { setSnackbar({ message: err instanceof Error ? err.message : "Erreur.", type: "error" }); },
  });

  const updateMutation = useMutation({
    mutationFn: () => leaveService.updateLeaveType(editingId!, form),
    onSuccess: () => { invalidate(); closeForm(); setSnackbar({ message: "Type mis à jour.", type: "success" }); },
    onError: (err: unknown) => { setSnackbar({ message: err instanceof Error ? err.message : "Erreur.", type: "error" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => leaveService.deleteLeaveType(deletingId!),
    onSuccess: () => { invalidate(); setDeletingId(null); setSnackbar({ message: "Type supprimé.", type: "success" }); },
    onError: (err: unknown) => { setSnackbar({ message: err instanceof Error ? err.message : "Erreur.", type: "error" }); },
  });

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setIsFormOpen(true); };

  const openEdit = (type: LeaveType) => {
    setForm({ label: type.label, isPaid: type.isPaid, requiresProof: type.requiresProof, deductionMode: type.deductionMode, cap: type.cap, capPeriod: type.capPeriod });
    setEditingId(type.idLeaveType);
    setIsFormOpen(true);
  };

  const closeForm = () => { setIsFormOpen(false); setEditingId(null); setForm(EMPTY_FORM); };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); editingId ? updateMutation.mutate() : createMutation.mutate(); };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Types de Congés</h2>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> Nouveau type
        </button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
            <tr>
              <th className="px-4 py-3">Libellé</th>
              <th className="px-4 py-3">Payé</th>
              <th className="px-4 py-3">Justificatif</th>
              <th className="px-4 py-3">Mode de déduction</th>
              <th className="px-4 py-3">Plafond</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {typesQuery.isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Chargement...</td></tr>
            ) : leaveTypes.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Aucun type de congé défini.</td></tr>
            ) : leaveTypes.map(lt => (
              <tr key={lt.idLeaveType} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium">{lt.label}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${lt.isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{lt.isPaid ? "Oui" : "Non"}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${lt.requiresProof ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"}`}>{lt.requiresProof ? "Requis" : "Non requis"}</span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{DEDUCTION_MODE_LABELS[lt.deductionMode] ?? lt.deductionMode}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {lt.cap ? `${lt.cap}j / ${CAP_PERIOD_LABELS[lt.capPeriod ?? ""] ?? lt.capPeriod}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(lt)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeletingId(lt.idLeaveType)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl border overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">{editingId ? "Modifier le type" : "Nouveau type de congé"}</h3>
              <button onClick={closeForm} className="w-8 h-8 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Libellé <span className="text-destructive">*</span></label>
                <input required type="text" placeholder="Ex: Congé Maternité" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors">
                  <input type="checkbox" className="w-4 h-4 accent-primary" checked={form.isPaid} onChange={e => setForm({ ...form, isPaid: e.target.checked })} />
                  <span className="text-sm font-medium">Congé payé</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors">
                  <input type="checkbox" className="w-4 h-4 accent-primary" checked={form.requiresProof} onChange={e => setForm({ ...form, requiresProof: e.target.checked })} />
                  <span className="text-sm font-medium">Justificatif requis</span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mode de déduction <span className="text-destructive">*</span></label>
                <select required value={form.deductionMode} onChange={e => setForm({ ...form, deductionMode: e.target.value as LeaveType["deductionMode"], cap: null, capPeriod: null })} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="ALWAYS">Toujours — déduit du solde annuel</option>
                  <option value="NEVER">Jamais — solde propre indépendant</option>
                  <option value="OPTIONAL">Au choix — l'agent décide à chaque demande</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  {form.deductionMode === "ALWAYS" && "Ce congé sera toujours déduit du solde annuel. Un solde négatif est autorisé."}
                  {form.deductionMode === "NEVER" && "Ce congé ne sera jamais déduit du solde annuel. Il possède son propre compteur."}
                  {form.deductionMode === "OPTIONAL" && "L'agent décide à chaque demande. Aucun plafond n'est applicable pour ce mode."}
                </p>
              </div>

              {form.deductionMode !== "OPTIONAL" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Plafond (jours)</label>
                    <input type="number" min={1} placeholder="Ex: 14" value={form.cap ?? ""} onChange={e => setForm({ ...form, cap: e.target.value ? Number(e.target.value) : null, capPeriod: e.target.value ? form.capPeriod : null })} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    <p className="text-xs text-muted-foreground">Laisser vide = aucun plafond</p>
                  </div>
                  {form.cap !== null && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Période <span className="text-destructive">*</span></label>
                      <select required value={form.capPeriod ?? ""} onChange={e => setForm({ ...form, capPeriod: e.target.value as LeaveType["capPeriod"] })} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                        <option value="">Choisir...</option>
                        <option value="ANNUAL">Par an (se réinitialise chaque année)</option>
                        <option value="LIFETIME">À vie (plafond sur toute la durée du contrat)</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeForm} className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50">
                  {isSubmitting ? "Enregistrement..." : editingId ? "Mettre à jour" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={open => { if (!open) setDeletingId(null); }}
        title="Supprimer ce type de congé ?"
        description="Cette action est irréversible. Les congés existants de ce type ne seront pas supprimés, mais aucun nouveau ne pourra être créé avec ce type."
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
        confirmText="Supprimer"
      />

      {snackbar && <Snackbar message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar(null)} />}
    </div>
  );
}

