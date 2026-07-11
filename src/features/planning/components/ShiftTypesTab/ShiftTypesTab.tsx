import React, { useState } from "react";
import { Plus, Edit, Trash2, Search, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import type { ShiftType } from "../../types/type";

interface ShiftTypesTabProps {
  shifts: ShiftType[];
  isEditing: string | null;
  editForm: Partial<ShiftType>;
  setEditForm: (form: Partial<ShiftType>) => void;
  setIsEditing: (id: string | null) => void;
  onCreate: () => void;
  onEdit: (shift: ShiftType) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
}

export function ShiftTypesTab({ 
  shifts, 
  isEditing, 
  editForm, 
  setEditForm, 
  setIsEditing,
  onCreate,
  onEdit,
  onSave,
  onDelete 
}: ShiftTypesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredShifts = shifts.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un type d'horaire..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-background border-border/50"
          />
        </div>
        <Button onClick={onCreate} className="gap-2 px-6 rounded-xl">
          <Plus className="size-4" />
          Nouveau Type d'Horaire
        </Button>
      </div>

      <div className="bg-background border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium text-muted-foreground">Libellé</th>
              <th className="px-6 py-4 font-medium text-muted-foreground">Heure de début</th>
              <th className="px-6 py-4 font-medium text-muted-foreground">Heure de fin</th>
              <th className="px-6 py-4 font-medium text-muted-foreground">Description</th>
              <th className="px-6 py-4 font-medium text-right text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isEditing && !shifts.find(s => s.idShiftType === isEditing) && (
              <tr className="border-b bg-muted/10">
                <td className="px-6 py-3">
                  <Input 
                    autoFocus
                    placeholder="Libellé"
                    value={editForm.label || ""}
                    onChange={(e) => setEditForm({...editForm, label: e.target.value})}
                    className="h-8"
                  />
                </td>
                <td className="px-6 py-3">
                  <Input 
                    type="time"
                    value={editForm.customStartTime || ""}
                    onChange={(e) => setEditForm({...editForm, customStartTime: e.target.value})}
                    className="h-8"
                  />
                </td>
                <td className="px-6 py-3">
                  <Input 
                    type="time"
                    value={editForm.customEndTime || ""}
                    onChange={(e) => setEditForm({...editForm, customEndTime: e.target.value})}
                    className="h-8"
                  />
                </td>
                <td className="px-6 py-3">
                  <Input 
                    placeholder="Description"
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="h-8"
                  />
                </td>
                <td className="px-6 py-3 text-right space-x-2">
                  <Button size="sm" onClick={onSave} disabled={!editForm.label?.trim() || !editForm.customStartTime || !editForm.customEndTime}>Enregistrer</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(null)}>Annuler</Button>
                </td>
              </tr>
            )}

            {filteredShifts.map((shift) => (
              <tr key={shift.idShiftType} className="border-b hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  {isEditing === shift.idShiftType ? (
                    <Input 
                      autoFocus
                      value={editForm.label || ""}
                      onChange={(e) => setEditForm({...editForm, label: e.target.value})}
                      className="h-8"
                    />
                  ) : (
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <Clock className="size-4 text-primary" />
                      {shift.label}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {isEditing === shift.idShiftType ? (
                    <Input 
                      type="time"
                      value={editForm.customStartTime || ""}
                      onChange={(e) => setEditForm({...editForm, customStartTime: e.target.value})}
                      className="h-8"
                    />
                  ) : (
                    shift.customStartTime
                  )}
                </td>
                <td className="px-6 py-4">
                  {isEditing === shift.idShiftType ? (
                    <Input 
                      type="time"
                      value={editForm.customEndTime || ""}
                      onChange={(e) => setEditForm({...editForm, customEndTime: e.target.value})}
                      className="h-8"
                    />
                  ) : (
                    shift.customEndTime
                  )}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {isEditing === shift.idShiftType ? (
                    <Input 
                      value={editForm.description || ""}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="h-8"
                    />
                  ) : (
                    shift.description || "-"
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {isEditing === shift.idShiftType ? (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={onSave} disabled={!editForm.label?.trim()}>Enregistrer</Button>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditing(null)}>Annuler</Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEdit(shift)}>
                        <Edit className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(shift.idShiftType)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            
            {filteredShifts.length === 0 && !isEditing && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  Aucun horaire trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
