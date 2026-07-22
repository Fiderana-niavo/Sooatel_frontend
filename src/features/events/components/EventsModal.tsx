import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { Calendar, Edit, Trash2, Plus, X, Check, Search } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import type { Event } from "../types";

interface EventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Event[];
  onAdd: (data: Partial<Event>) => void;
  onEdit: (id: string, data: Partial<Event>) => void;
  onDelete: (id: string) => void;
}

export function EventsModal({ isOpen, onClose, data, onAdd, onEdit, onDelete }: EventsModalProps) {
  const [newEventName, setNewEventName] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEventName, setEditEventName] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");

  const [search, setSearch] = useState("");

  const [missingEndDateConfirm, setMissingEndDateConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<"add" | "edit" | null>(null);

  const executeAdd = (forceOneDay: boolean) => {
    if (newStartDate) {
      onAdd({
        eventName: newEventName.trim() || null,
        startDate: new Date(newStartDate),
        endDate: forceOneDay ? new Date(newStartDate) : (newEndDate ? new Date(newEndDate) : undefined),
      } as any);
      setNewEventName("");
      setNewStartDate("");
      setNewEndDate("");
    }
  };

  const handleAdd = () => {
    if (!newStartDate) return;
    if (!newEndDate) {
      setPendingAction("add");
      setMissingEndDateConfirm(true);
    } else {
      executeAdd(false);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.idEvent);
    setEditEventName(item.eventName || "");
    setEditStartDate(item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : "");
    setEditEndDate(item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : "");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const executeEdit = (forceOneDay: boolean) => {
    if (editStartDate && editingId) {
      onEdit(editingId, {
        eventName: editEventName.trim() || null,
        startDate: new Date(editStartDate),
        endDate: forceOneDay ? new Date(editStartDate) : (editEndDate ? new Date(editEndDate) : undefined),
      } as any);
      setEditingId(null);
    }
  };

  const saveEdit = () => {
    if (!editStartDate || !editingId) return;
    if (!editEndDate) {
      setPendingAction("edit");
      setMissingEndDateConfirm(true);
    } else {
      executeEdit(false);
    }
  };

  const handleConfirmOneDay = () => {
    if (pendingAction === "add") executeAdd(true);
    if (pendingAction === "edit") executeEdit(true);
    setMissingEndDateConfirm(false);
    setPendingAction(null);
  };

  const filteredData = data.filter((r) =>
    r.eventName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent 
        className="max-w-4xl rounded-[2rem] p-0 overflow-hidden bg-card border shadow-2xl"
        onInteractOutside={(e) => {
          if (missingEndDateConfirm) e.preventDefault();
        }}
      >
        <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-8 border-b">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/20 text-primary rounded-xl">
                  <Calendar className="size-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight text-secondary">
                    Évènements
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground mt-1 text-sm">
                    Gérez les évènements de l'hôtel.
                  </DialogDescription>
                </div>
              </div>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64 bg-background"
                />
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="bg-muted/10 p-5 rounded-2xl border border-border/50">
            <h4 className="text-sm font-semibold mb-4 text-foreground">Ajouter un évènement</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Nom</label>
                <Input placeholder="Soirée..." value={newEventName} onChange={(e) => setNewEventName(e.target.value)} className="bg-background" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Date début</label>
                <Input type="date" value={newStartDate} onChange={(e) => {
                  setNewStartDate(e.target.value);
                  // Auto-correct end date if it's now before the new start date
                  if (newEndDate && e.target.value > newEndDate) setNewEndDate(e.target.value);
                }} className="bg-background" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Date fin</label>
                <Input type="date" value={newEndDate} min={newStartDate} onChange={(e) => setNewEndDate(e.target.value)} className="bg-background" disabled={!newStartDate} />
              </div>
              <Button onClick={handleAdd} disabled={!newStartDate} className="gap-2 rounded-xl h-10 w-full md:w-auto md:justify-center">
                <Plus className="size-4" /> Ajouter
              </Button>
            </div>
          </div>

          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
                Aucun évènement.
              </div>
            ) : (
              filteredData.map((item: any) => (
                <div key={item.idEvent} className="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors group">
                  {editingId === item.idEvent ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                      <Input value={editEventName} onChange={(e) => setEditEventName(e.target.value)} className="h-9" placeholder="Nom" />
                      <Input type="date" value={editStartDate} onChange={(e) => {
                        setEditStartDate(e.target.value);
                        if (editEndDate && e.target.value > editEndDate) setEditEndDate(e.target.value);
                      }} className="h-9" />
                      <Input type="date" value={editEndDate} min={editStartDate} onChange={(e) => setEditEndDate(e.target.value)} className="h-9" disabled={!editStartDate} />
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={saveEdit} className="text-green-600"><Check className="size-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={cancelEdit}><X className="size-4" /></Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="font-semibold text-foreground w-1/3 truncate">{item.eventName || "Sans nom"}</div>
                        <div className="text-sm text-muted-foreground w-1/3">Du: {item.startDate ? new Date(item.startDate).toLocaleDateString() : "-"}</div>
                        <div className="text-sm text-muted-foreground w-1/3">Au: {item.endDate ? new Date(item.endDate).toLocaleDateString() : "-"}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(item)} className="opacity-0 group-hover:opacity-100"><Edit className="size-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => onDelete(item.idEvent)} className="opacity-0 group-hover:opacity-100 text-destructive"><Trash2 className="size-4" /></Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="p-4 bg-muted/10 border-t">
          <Button onClick={onClose} variant="outline" className="w-full sm:w-auto rounded-xl">Fermer</Button>
        </DialogFooter>

        {/* Confirmation Dialog for single day events */}
        <ConfirmDialog
          open={missingEndDateConfirm}
          onOpenChange={(open) => {
            setMissingEndDateConfirm(open);
            if (!open) setPendingAction(null);
          }}
          title="Évènement sur une journée ?"
          description="Vous n'avez pas précisé de date de fin. Souhaitez-vous que cet évènement se termine le même jour que son début ?"
          onConfirm={handleConfirmOneDay}
        />
      </DialogContent>
    </Dialog>
  );
}
