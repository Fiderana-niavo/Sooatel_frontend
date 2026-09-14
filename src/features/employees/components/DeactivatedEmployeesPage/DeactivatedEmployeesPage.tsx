import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { EmployeeService } from "../../services/employee.service";

export function DeactivatedEmployeesPage({
  setPageTitle,
}: {
  setPageTitle: (title: string) => void;
}) {
  const [deactivations, setDeactivations] = useState<{ idEmployee: string; fullName: string; endDate: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 15;

  useEffect(() => {
    setPageTitle("Détails des comptes désactivés");
  }, [setPageTitle]);

  useEffect(() => {
    EmployeeService.getRecentDeactivations({ page: currentPage, limit })
      .then((res) => {
        setDeactivations(res.records);
        setTotalPages(res.totalPages);
      })
      .catch(console.error);
  }, [currentPage]);

  return (
    <div className="w-full space-y-6">
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-2xl flex items-start gap-4 shadow-sm">
        <AlertTriangle className="size-6 text-amber-600 mt-0.5" />
        <div>
          <h4 className="font-semibold text-amber-900 text-lg">
            Historique des désactivations automatiques
          </h4>
          <p className="text-sm mt-1 text-amber-800/80">
            Voici la liste complète des comptes utilisateurs qui ont été désactivés automatiquement suite à l'échéance de leur contrat.
            Vous pouvez réactiver ces comptes en effectuant un changement ou un renouvellement de poste depuis la liste principale.
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-xs">Employé</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-xs w-48">Date de fin de contrat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deactivations.length > 0 ? (
              deactivations.map((emp) => (
                <tr key={emp.idEmployee} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{emp.fullName}</td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(emp.endDate).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-muted-foreground">
                  Aucun compte n'a été désactivé récemment.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
