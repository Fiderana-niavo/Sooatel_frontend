import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TeamRotationPanel } from "../forms/TeamRotationPanel/TeamRotationPanel";
import { ScheduleGrid } from "../list/ScheduleGrid/ScheduleGrid";
import { SaveBar } from "../list/SaveBar/SaveBar";
import { TimetableService } from "../../services/timetable.service";
import { TeamService } from "@/features/planning/services/team.service";
import { ShiftTypeService } from "@/features/planning/services/shift-type.service";

import type {
  GeneratedScheduleRow,
  AvailableEmployee,
  CheckExistingResult,
} from "../../types/timetable.type";
import type { Team, ShiftType } from "@/features/planning/types/type";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import { toIsoDate, addDays, buildDayRange } from "@/utils/date";
import { OverwriteWarningDialog } from "../list/OverwriteWarningDialog/OverwriteWarningDialog";
import { EmployeeRequirementService } from "@/features/job-titles/services/employee-requirement.service";
import { TimetableHeader, type Mode } from "../TimetableHeader/TimetableHeader";
import { computeSlots } from "../../utils/slots.util";



// ─── Main page ────────────────────────────────────────────────────────────────

export function TimetablePage() {
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<Mode>("team");
  const [startDate, setStartDate] = useState<string>(toIsoDate(new Date()));
  const [endDate, setEndDate] = useState<string>(addDays(toIsoDate(new Date()), 6));

  const [generatedRows, setGeneratedRows] = useState<GeneratedScheduleRow[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [idRotationShift, setIdRotationShift] = useState<string>("");

  const [overwriteWarning, setOverwriteWarning] = useState<CheckExistingResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const days = buildDayRange(startDate, endDate);

  // ─── Data loading ───────────────────────────────────────────────────────

  const teamsQuery = useQuery({
    queryKey: ["teams"],
    queryFn: () => TeamService.getAll(),
  });

  const shiftsQuery = useQuery({
    queryKey: ["shifts"],
    queryFn: () => ShiftTypeService.getAll(),
  });

  const requirementsQuery = useQuery({
    queryKey: ["employee-requirements"],
    queryFn: () => EmployeeRequirementService.getAll(),
  });

  // Auto-load existing schedules for the selected range
  const existingQuery = useQuery({
    queryKey: ["schedule-range", startDate, endDate],
    queryFn: () => TimetableService.getByRange(startDate, endDate),
    enabled: !!(startDate && endDate),
  });

  // When existing data loads and grid is empty, populate from existing
  const existingRows: GeneratedScheduleRow[] = (existingQuery.data ?? []).map((s) => ({
    idEmployee: s.idEmployee,
    employeeName: s.employeeName,
    idJobTitle: s.idJobTitle ?? null,
    jobTitle: s.jobTitle ?? null,
    scheduleDate: s.scheduleDate,
    idShiftType: s.idShiftType,
    shiftLabel: s.shiftLabel,
    customStartTime: s.customStartTime,
    customEndTime: s.customEndTime,
    isOnLeave: false,
  }));

  // Available employees for cell selects
  const availEmpQuery = useQuery({
    queryKey: ["available-employees", startDate],
    queryFn: () => TimetableService.getAvailableEmployees({ date: startDate }),
  });

  const allEmployees: AvailableEmployee[] = availEmpQuery.data ?? [];

  const availableByJobTitle = useCallback((): Map<string, AvailableEmployee[]> => {
    const map = new Map<string, AvailableEmployee[]>();
    for (const emp of allEmployees) {
      if (!emp.idJobTitle) continue;
      if (!map.has(emp.idJobTitle)) map.set(emp.idJobTitle, []);
      map.get(emp.idJobTitle)!.push(emp);
    }
    return map;
  }, [allEmployees]);

  // Derive the displayed rows: prefer edited rows, fall back to existing
  const displayedRows = isDirty ? generatedRows : existingRows;

  // ─── Slots from requirements & generated rows ───────────────────────────

  const slots = computeSlots(requirementsQuery.data ?? [], displayedRows);

  // ─── Row change handler ─────────────────────────────────────────────────

  const handleRowChange = (
    date: string,
    idShiftType: string | null,
    idJobTitle: string | null,
    slotIndex: number,
    updated: GeneratedScheduleRow | null,
  ) => {
    // Start from existing rows if not yet dirty
    const base = isDirty ? generatedRows : [...existingRows];

    const others = base.filter(
      (r) =>
        !(
          r.scheduleDate === date &&
          r.idShiftType === idShiftType &&
          r.idJobTitle === idJobTitle
        ),
    );
    const group = base.filter(
      (r) =>
        r.scheduleDate === date &&
        r.idShiftType === idShiftType &&
        r.idJobTitle === idJobTitle,
    );
    const newGroup = [...group];
    if (updated) {
      newGroup[slotIndex] = updated;
    } else {
      newGroup.splice(slotIndex, 1);
    }

    setGeneratedRows([...others, ...newGroup.filter(Boolean)]);
    setIsDirty(true);
  };

  // ─── Generate by team ───────────────────────────────────────────────────

  const runGenerate = async () => {
    setIsGenerating(true);
    setOverwriteWarning(null);
    try {
      const rows = await TimetableService.generateByTeam({
        startDate,
        endDate,
        idRotationShift,
        teamIds: selectedTeamIds,
        shiftIds: [idRotationShift],
      });
      setGeneratedRows(rows);
      setIsDirty(true);
    } catch (err) {
      setSnackbar({
        message: (err as Error).message || "Erreur lors de la génération.",
        type: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateByTeam = async () => {
    if (selectedTeamIds.length === 0 || !idRotationShift) return;

    // Check for existing schedules in range
    try {
      const check = await TimetableService.checkExisting(startDate, endDate);
      if (check.hasExisting) {
        setOverwriteWarning(check);
        return;
      }
    } catch {
      // If check fails, proceed anyway
    }

    await runGenerate();
  };

  // ─── Save planning ──────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: () =>
      TimetableService.saveSchedules({
        rows: displayedRows.map((r) => ({
          idEmployee: r.idEmployee,
          scheduleDate: r.scheduleDate,
          idShiftType: r.idShiftType,
          customStartTime: r.customStartTime,
          customEndTime: r.customEndTime,
        })),
        overwrite: true, // always overwrite on validate — we already warned the user
        startDate,
        endDate,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-range"] });
      setSnackbar({ message: "Planning enregistré avec succès.", type: "success" });
      setIsDirty(false);
      setGeneratedRows([]);
    },
    onError: (err) => {
      setSnackbar({
        message: (err as Error).message || "Erreur lors de l'enregistrement.",
        type: "error",
      });
    },
  });

  const teams: Team[] = teamsQuery.data ?? [];
  const shifts: ShiftType[] = shiftsQuery.data ?? [];
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <TimetableHeader
        startDate={startDate}
        endDate={endDate}
        onStartChange={(v) => { setStartDate(v); setIsDirty(false); setGeneratedRows([]); }}
        onEndChange={(v) => { setEndDate(v); setIsDirty(false); setGeneratedRows([]); }}
        existingCount={existingQuery.data?.length ?? 0}
        isLoadingExisting={existingQuery.isLoading}
        isDirty={isDirty}
        mode={mode}
        onModeChange={setMode}
      />

      {/* Team rotation panel */}
      {mode === "team" && (
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <TeamRotationPanel
            teams={teams}
            shifts={shifts}
            selectedTeamIds={selectedTeamIds}
            idRotationShift={idRotationShift}
            isGenerating={isGenerating}
            onSelectedTeamsChange={setSelectedTeamIds}
            onRotationShiftChange={setIdRotationShift}
            onGenerate={handleGenerateByTeam}
          />


        </div>
      )}

      {/* Schedule grid */}
      <ScheduleGrid
        days={days}
        slots={slots}
        rows={displayedRows}
        availableByJobTitle={availableByJobTitle()}
        allEmployees={allEmployees}
        onRowChange={handleRowChange}
      />

      {/* Save bar */}
      <SaveBar
        isDirty={isDirty}
        isSaving={saveMutation.isPending}
        rowCount={displayedRows.length}
        onSave={() => saveMutation.mutate()}
        onReset={() => {
          setGeneratedRows([]);
          setIsDirty(false);
        }}
      />

      {/* Overwrite warning dialog */}
      {overwriteWarning && (
        <OverwriteWarningDialog
          result={overwriteWarning}
          onConfirm={runGenerate}
          onCancel={() => setOverwriteWarning(null)}
        />
      )}

      {snackbar && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar(null)}
        />
      )}
    </div>
  );
}
