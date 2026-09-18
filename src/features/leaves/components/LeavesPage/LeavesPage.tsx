import React, { useState, useEffect } from "react";
import { Users, Search, AlertCircle, HeartHandshake, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmployeeService } from "@/features/employees/services/employee.service";
import { leaveService } from "../../services/leave.service";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import Pagination from "@/components/ui/Pagination/pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";

// ============================================================================
// COMPONENT: LeavesPage (Main page)
// ============================================================================
export function LeavesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await EmployeeService.getAll({ limit: 1000 });
      return res.records;
    },
  });

  const filteredEmployees = employees.filter((emp) =>
    `${emp.name} ${emp.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedEmployee = employees.find(e => e.idEmployee === selectedEmployeeId);

  return (
    <div className="flex h-[calc(100vh-12rem)] overflow-hidden bg-background rounded-2xl border shadow-sm">
      {/* Left column: Employee List */}
      <div className="w-[380px] border-r bg-muted/10 flex flex-col">
        <div className="p-4 border-b bg-background">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" /> Employés
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un employé..."
              className="w-full pl-9 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingEmployees ? (
            <div className="p-4 text-center text-sm text-muted-foreground animate-pulse">Chargement...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Aucun employé trouvé.</div>
          ) : (
            filteredEmployees.map((emp) => (
              <button
                key={emp.idEmployee}
                onClick={() => setSelectedEmployeeId(emp.idEmployee)}
                className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${selectedEmployeeId === emp.idEmployee
                  ? "bg-primary/10 border-primary/20 border"
                  : "hover:bg-muted/50 border border-transparent"
                  }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {emp.name.charAt(0)}{emp.lastname.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{emp.name} {emp.lastname}</div>
                  <div className="text-xs text-muted-foreground truncate">{emp.jobTitle || "Sans poste"}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right column: Leave Details */}
      <div className="flex-1 overflow-y-auto bg-background">
        {selectedEmployeeId && selectedEmployee ? (
          <EmployeeLeaveDetails employee={selectedEmployee} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <HeartHandshake className="w-16 h-16 opacity-20 mb-4" />
            <p>Sélectionnez un employé pour gérer ses congés</p>
          </div>
        )}
      </div>
    </div>
  );
}

function EmployeeLeaveDetails({ employee }: { employee: any }) {
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const isPending = employee.status === 5;
  const isConfirmed = employee.status === 0;

  const { data: leaveTypes = [] } = useQuery({
    queryKey: ["leave-types"],
    queryFn: leaveService.getLeaveTypes
  });

  const defaultLeaveType = leaveTypes.find(lt => lt.label === "Congé Payé") || leaveTypes[0];
  const DEFAULT_LEAVE_TYPE_ID = defaultLeaveType?.idLeaveType;

  const { data: balances = [] } = useQuery({
    queryKey: ["leave-balances", employee.idEmployee],
    queryFn: () => leaveService.getBalances(employee.idEmployee),
    enabled: !!employee.idEmployee,
  });

  const defaultBalance = balances.find(b => b.idLeaveType === DEFAULT_LEAVE_TYPE_ID) || null;
  const totalAdvance = balances.reduce((sum, b) => sum + (Number(b.advanceDays) || 0), 0);

  const { data: transactions = [], isLoading: isLoadingTx } = useQuery({
    queryKey: ["leave-transactions", employee.idEmployee],
    queryFn: () => leaveService.getTransactions(employee.idEmployee),
    enabled: !!employee.idEmployee,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [employee.idEmployee]);

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTransactions = transactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const confirmMutation = useMutation({
    mutationFn: (id: string) => leaveService.confirmJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setSnackbar({ message: "Employé confirmé avec succès.", type: "success" });
    },
    onError: (err: any) => {
      setSnackbar({ message: err.response?.data?.message || "Une erreur est survenue.", type: "error" });
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<{ isOpen: boolean; idLeave: string | null }>({ isOpen: false, idLeave: null });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leaveService.deleteLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-balances", employee.idEmployee] });
      queryClient.invalidateQueries({ queryKey: ["leave-transactions", employee.idEmployee] });
      setSnackbar({ message: "Congé supprimé avec succès.", type: "success" });
    },
    onError: (err: any) => {
      setSnackbar({ message: err.response?.data?.message || "Une erreur est survenue.", type: "error" });
    }
  });

  const handleDeleteConfirm = () => {
    if (deleteConfirmOpen.idLeave) {
      deleteMutation.mutate(deleteConfirmOpen.idLeave);
    }
    setDeleteConfirmOpen({ isOpen: false, idLeave: null });
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
      <div className="flex items-start justify-between border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold">{employee.name} {employee.lastname}</h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            Code: {employee.employeeCode} • {employee.jobTitle || "Aucun poste"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isPending && (
            <div className="bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> En attente de confirmation
            </div>
          )}
          {isConfirmed && (
            <div className="bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Confirmé
            </div>
          )}
        </div>
      </div>

      {isPending && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3 text-amber-700">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold">Employé non confirmé</h4>
              <p className="text-sm mt-1 opacity-90">Les congés posés par cet employé seront comptabilisés comme des avances sur congé et déduits du salaire s'ils ne sont pas récupérés.</p>
            </div>
          </div>
          <button
            onClick={() => confirmMutation.mutate(employee.idEmployee)}
            disabled={confirmMutation.isPending}
            className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
          >
            {confirmMutation.isPending ? "Confirmation..." : "Confirmer l'employé"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border rounded-xl p-5 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground mb-1">Jours Restants</div>
          <div className="text-2xl font-bold mt-1 text-emerald-600">{defaultBalance?.availableDays || 0}</div>
        </div>
        <div className="bg-card p-4 rounded-xl border">
          <div className="text-sm text-muted-foreground mt-1">Jours Pris</div>
          <div className="text-2xl font-bold mt-1 text-blue-600">{defaultBalance?.usedDays || 0}</div>
        </div>
        <div className="bg-card p-4 rounded-xl border">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-amber-500" />
            <div className="text-sm text-muted-foreground">Avance (Dette)</div>
          </div>
          <div className="text-2xl font-bold mt-1 text-amber-600">{totalAdvance}</div>
          <div className="text-xs text-muted-foreground mt-2">À déduire ou à rattraper</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <h3 className="text-lg font-bold">Historique des transactions</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          Poser un congé
        </button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm mt-4 flex flex-col">
        <div className="overflow-auto max-h-[240px]">
          <table className="w-full min-w-[700px] text-sm text-left relative">
            <thead className="bg-muted/95 backdrop-blur text-muted-foreground font-medium border-b sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 min-w-[200px]">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 whitespace-nowrap">Montant (Jours)</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3 text-right w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoadingTx ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Chargement...</td></tr>
              ) : currentTransactions.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Aucune transaction trouvée.</td></tr>
              ) : (
                currentTransactions.map(tx => (
                  <tr key={tx.idTransaction} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">{new Date(tx.createdAt).toLocaleDateString("fr-FR", { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${tx.transactionType === "ALLOCATION" ? "bg-emerald-100 text-emerald-700" :
                        tx.transactionType === "ADVANCE" ? "bg-amber-100 text-amber-700" :
                          tx.transactionType === "SALARY_DEDUCTION" ? "bg-purple-100 text-purple-700" :
                            "bg-blue-100 text-blue-700"
                        }`}>
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-medium whitespace-nowrap ${tx.transactionType === "ALLOCATION" ? "text-emerald-600" : "text-destructive"}`}>
                      {tx.transactionType === "ALLOCATION" ? "+" : "-"}{Math.abs(tx.amount)}
                    </td>
                    <td className="px-4 py-3">{tx.leaveTypeLabel || "Standard"}</td>
                    <td className="px-4 py-3 text-right">
                      {tx.idLeave && (
                        <button
                          onClick={() => setDeleteConfirmOpen({ isOpen: true, idLeave: tx.idLeave })}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          title="Supprimer ce congé"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-center px-4 py-4 border-t bg-muted/10">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {isModalOpen && (
        <CreateLeaveModal
          employee={employee}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => setSnackbar({ message: "Congé enregistré avec succès.", type: "success" })}
          onError={(msg) => setSnackbar({ message: msg, type: "error" })}
        />
      )}

      {snackbar && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar(null)}
        />
      )}

      <ConfirmDialog
        open={deleteConfirmOpen.isOpen}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmOpen({ isOpen: false, idLeave: null });
        }}
        title="Supprimer le congé"
        description="Êtes-vous sûr de vouloir supprimer ce congé ? Cette action est irréversible et le solde de l'employé sera recalculé automatiquement."
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteConfirm}
        confirmButtonClassName="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
      />
    </div>
  );
}

// ============================================================================
// COMPONENT: CreateLeaveModal
// ============================================================================
function CreateLeaveModal({ employee, onClose, onSuccess, onError }: { employee: any, onClose: () => void, onSuccess: () => void, onError: (msg: string) => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ startDate: "", endDate: "", idLeaveType: "" });
  const [deductFromAnnual, setDeductFromAnnual] = useState(false);
  const [isOneDayDialogOpen, setIsOneDayDialogOpen] = useState(false);
  const [overflow, setOverflow] = useState<{ capDays: number; overflowDays: number; leaveTypeLabel: string } | null>(null);
  const [overflowResolution, setOverflowResolution] = useState<"ANNUAL" | "UNPAID" | null>(null);

  const isPending = employee.status === 5;

  const { data: leaveTypes = [] } = useQuery({
    queryKey: ["leave-types"],
    queryFn: leaveService.getLeaveTypes
  });

  const selectedType = leaveTypes.find(lt => lt.idLeaveType === formData.idLeaveType) || null;
  const isOptional = selectedType?.deductionMode === "OPTIONAL";

  // Annual and unpaid leave type IDs for overflow resolution
  const annualType = leaveTypes.find(lt => lt.deductionMode === "ALWAYS");
  const unpaidType = leaveTypes.find(lt => !lt.isPaid && lt.deductionMode === "NEVER");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["leave-balances", employee.idEmployee] });
    queryClient.invalidateQueries({ queryKey: ["leave-transactions", employee.idEmployee] });
  };

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof leaveService.createLeave>[0]) => leaveService.createLeave(data),
    onSuccess: (result) => {
      // Backend returned 202 with overflow info
      if (result && "needsOverflowResolution" in result) {
        setOverflow({ capDays: result.capDays, overflowDays: result.overflowDays, leaveTypeLabel: result.leaveTypeLabel });
        return;
      }
      invalidate();
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      onError(err.response?.data?.message || err.message || "Une erreur est survenue.");
    }
  });

  const resolveMutation = useMutation({
    mutationFn: (data: Parameters<typeof leaveService.resolveOverflow>[0]) => leaveService.resolveOverflow(data),
    onSuccess: () => {
      invalidate();
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      onError(err.response?.data?.message || err.message || "Une erreur est survenue.");
    }
  });

  const submitCreate = (startDate: string, endDate: string) => {
    createMutation.mutate({
      ...formData,
      startDate,
      endDate,
      idEmployee: employee.idEmployee,
      deductFromAnnual: isOptional ? deductFromAnnual : undefined,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.endDate) {
      setIsOneDayDialogOpen(true);
      return;
    }
    submitCreate(formData.startDate, formData.endDate);
  };

  const handleConfirmOneDay = () => {
    setIsOneDayDialogOpen(false);
    submitCreate(formData.startDate, formData.startDate);
  };

  const handleOverflowConfirm = () => {
    if (!overflowResolution || !overflow) return;
    resolveMutation.mutate({
      idEmployee: employee.idEmployee,
      idLeaveType: formData.idLeaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      capDays: overflow.capDays,
      overflowDays: overflow.overflowDays,
      resolution: overflowResolution,
      idAnnualLeaveType: annualType?.idLeaveType,
      idUnpaidLeaveType: unpaidType?.idLeaveType,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden border">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Poser un congé</h3>
            <p className="text-sm text-muted-foreground mt-1">Pour {employee.name} {employee.lastname}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          <div className="space-y-2">
            <label className="text-sm font-medium">Type / Raison <span className="text-destructive">*</span></label>
            <select
              required
              className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={formData.idLeaveType}
              onChange={e => setFormData({ ...formData, idLeaveType: e.target.value })}
            >
              <option value="">Sélectionner une raison...</option>
              {leaveTypes.map(lt => (
                <option key={lt.idLeaveType} value={lt.idLeaveType}>{lt.label} {lt.isPaid ? "(Payé)" : "(Sans Solde)"}</option>
              ))}
            </select>
          </div>

          {/* OPTIONAL mode: let user decide if it counts against annual balance */}
          {isOptional && (
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-primary/5 border border-primary/20">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={deductFromAnnual}
                onChange={e => setDeductFromAnnual(e.target.checked)}
              />
              <span className="text-sm font-medium">Déduire du congé annuel</span>
            </label>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date de début <span className="text-destructive">*</span></label>
              <input
                type="date"
                required
                className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date de fin</label>
              <input
                type="date"
                className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
              Annuler
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !formData.idLeaveType}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>

        {/* Dialog: no end date — use start as end (1 day) */}
        <ConfirmDialog
          open={isOneDayDialogOpen}
          onOpenChange={setIsOneDayDialogOpen}
          title="Date de fin manquante"
          description="Vous n'avez pas précisé de date de fin. Voulez-vous utiliser la date de début comme date de fin (soit 1 jour de congé) ?"
          onConfirm={handleConfirmOneDay}
          confirmButtonClassName="bg-primary hover:bg-primary/90 text-primary-foreground"
        />

        {/* Dialog: cap exceeded — choose what to do with overflow days */}
        {overflow && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border p-6 space-y-5">
              <h3 className="text-lg font-bold">Plafond de congé dépassé</h3>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{overflow.capDays} jour(s)</span> seront accordés sur votre solde <span className="font-medium">{overflow.leaveTypeLabel}</span>.
              </p>
              <p className="text-sm text-muted-foreground">
                Les <span className="font-medium text-foreground">{overflow.overflowDays} jour(s) restants</span> dépassent le plafond autorisé. Comment souhaitez-vous les traiter ?
              </p>
              <div className="space-y-3">
                {!isPending && (
                  <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors">
                    <input type="radio" name="resolution" className="accent-primary" value="ANNUAL" checked={overflowResolution === "ANNUAL"} onChange={() => setOverflowResolution("ANNUAL")} />
                    <div>
                      <div className="text-sm font-medium">Déduire du congé annuel</div>
                      <div className="text-xs text-muted-foreground">Les jours seront prélevés sur votre solde annuel</div>
                    </div>
                  </label>
                )}
                <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors">
                  <input type="radio" name="resolution" className="accent-primary" value="UNPAID" checked={overflowResolution === "UNPAID"} onChange={() => setOverflowResolution("UNPAID")} />
                  <div>
                    <div className="text-sm font-medium">Congé sans solde</div>
                    <div className="text-xs text-muted-foreground">Les jours seront déduits de votre prochain salaire</div>
                  </div>
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => { setOverflow(null); setOverflowResolution(null); }} className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
                  Annuler
                </button>
                <button
                  disabled={!overflowResolution || resolveMutation.isPending}
                  onClick={handleOverflowConfirm}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                  {resolveMutation.isPending ? "Enregistrement..." : "Confirmer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
