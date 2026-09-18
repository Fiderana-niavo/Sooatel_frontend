import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, AlertCircle, Loader2 } from "lucide-react";
import { leaveService } from "../../services/leave.service";
import { formatDate, getDaysLeft } from "@/utils/date";
import Pagination from "@/components/ui/Pagination/pagination";
import type { LeaveResponse } from "../../types/leave.type";

const PAGE_SIZE = 10;

export default function UpcomingLeavesPage() {
  const [page, setPage] = useState(1);

  const result = useQuery({
    queryKey: ["upcoming-leaves"],
    queryFn: leaveService.getUpcomingLeaves,
  });

  const upcomingLeaves: LeaveResponse[] = result.data ?? [];
  const totalPages = Math.max(1, Math.ceil(upcomingLeaves.length / PAGE_SIZE));
  const paginated = upcomingLeaves.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-start justify-between border-b pb-5">
        <div>
          <h2 className="text-2xl font-bold">Congés à venir</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Liste des congés prévus pour l'ensemble du personnel, triés par date de début
          </p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl flex items-center gap-2 font-semibold text-sm shrink-0">
          <CalendarDays className="w-4 h-4" />
          {upcomingLeaves.length} congé(s)
        </div>
      </div>

      {result.isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : result.isError ? (
        <div className="flex flex-col items-center justify-center h-48 text-destructive space-y-2">
          <AlertCircle className="w-8 h-8" />
          <p className="font-medium">Erreur lors du chargement des congés</p>
        </div>
      ) : upcomingLeaves.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 bg-muted/20 border border-dashed rounded-xl">
          <CalendarDays className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">Aucun congé prévu pour le moment</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-semibold">Employé</th>
                  <th className="text-left px-4 py-3 font-semibold">Type de congé</th>
                  <th className="text-left px-4 py-3 font-semibold">Date de début</th>
                  <th className="text-left px-4 py-3 font-semibold">Date de fin</th>
                  <th className="text-left px-4 py-3 font-semibold">Dans</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map((leave) => {
                  const daysLeft = getDaysLeft(leave.startDate);
                  const isUrgent = daysLeft <= 7;

                  return (
                    <tr key={leave.idLeave} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{leave.employeeName ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{leave.leaveTypeLabel ?? "—"}</td>
                      <td className="px-4 py-3">{formatDate(leave.startDate)}</td>
                      <td className="px-4 py-3">{formatDate(leave.endDate)}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold text-xs px-2 py-1 rounded-md ${
                          isUrgent ? "text-amber-700 bg-amber-100 dark:bg-amber-900/30" : "text-muted-foreground bg-muted/50"
                        }`}>
                          {daysLeft === 0 ? "Aujourd'hui" : `${daysLeft} j`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
