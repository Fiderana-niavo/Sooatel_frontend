import type { EmployeeRequirement } from "@/features/job-titles/types/type";
import type { GeneratedScheduleRow, RequirementSlot } from "../types/timetable.type";

export function computeSlots(
  requirements: EmployeeRequirement[],
  displayedRows: GeneratedScheduleRow[]
): RequirementSlot[] {
  const slots = requirements.reduce<RequirementSlot[]>((acc, r) => {
    const exists = acc.find(
      (s) => s.idJobTitle === r.idJobTitle && s.idShiftType === r.idShiftType,
    );
    if (!exists) {
      acc.push({
        idJobTitle: r.idJobTitle,
        jobTitle: r.jobTitle ?? null,
        idShiftType: r.idShiftType,
        shiftLabel: r.shiftLabel,
        requiredCount: r.requiredCount,
      });
    }
    return acc;
  }, []);

  // Synthesize slots from displayed rows (important for team generation)
  const rowsBySlotAndDate = new Map<string, number>();
  for (const r of displayedRows) {
    const key = `${r.idShiftType ?? "custom"}__${r.idJobTitle ?? "any"}__${r.scheduleDate}`;
    rowsBySlotAndDate.set(key, (rowsBySlotAndDate.get(key) ?? 0) + 1);
  }

  const maxCountPerSlot = new Map<string, number>();
  for (const [key, count] of rowsBySlotAndDate.entries()) {
    const [idShiftType, idJobTitle] = key.split("__");
    const slotKey = `${idShiftType}__${idJobTitle}`;
    const currentMax = maxCountPerSlot.get(slotKey) ?? 0;
    if (count > currentMax) maxCountPerSlot.set(slotKey, count);
  }

  for (const r of displayedRows) {
    const exists = slots.find(s => s.idJobTitle === r.idJobTitle && s.idShiftType === r.idShiftType);
    const slotKey = `${r.idShiftType ?? "custom"}__${r.idJobTitle ?? "any"}`;
    const needed = maxCountPerSlot.get(slotKey) ?? 1;

    if (!exists) {
      slots.push({
        idJobTitle: r.idJobTitle,
        jobTitle: r.jobTitle,
        idShiftType: r.idShiftType,
        shiftLabel: r.shiftLabel,
        requiredCount: needed,
      });
    } else if (needed > exists.requiredCount) {
      exists.requiredCount = needed;
    }
  }

  return slots;
}
