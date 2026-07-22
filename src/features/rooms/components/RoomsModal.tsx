import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { Bed, Edit, Trash2, Plus, X, Check, Search } from "lucide-react";
import type { Room } from "../types";
import type { RoomType } from "../../room-types/types";

interface RoomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Room[];
  roomTypes: RoomType[];
  onAdd: (data: Partial<Room>) => void;
  onEdit: (id: string, data: Partial<Room>) => void;
  onDelete: (id: string) => void;
}

export function RoomsModal({ isOpen, onClose, data, roomTypes, onAdd, onEdit, onDelete }: RoomsModalProps) {
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newIdRoomType, setNewIdRoomType] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRoomNumber, setEditRoomNumber] = useState("");
  const [editIdRoomType, setEditIdRoomType] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [search, setSearch] = useState("");

  const handleAdd = () => {
    if (newRoomNumber.trim() && newIdRoomType) {
      onAdd({
        roomNumber: newRoomNumber.trim(),
        idRoomType: newIdRoomType,
        description: newDescription.trim() || null,
      } as any);
      setNewRoomNumber("");
      setNewIdRoomType("");
      setNewDescription("");
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.idRoom);
    setEditRoomNumber(item.roomNumber || "");
    setEditIdRoomType(item.idRoomType || "");
    setEditDescription(item.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = () => {
    if (editRoomNumber.trim() && editIdRoomType && editingId) {
      onEdit(editingId, {
        roomNumber: editRoomNumber.trim(),
        idRoomType: editIdRoomType,
        description: editDescription.trim() || null,
      } as any);
      setEditingId(null);
    }
  };

  const filteredData = data.filter((r) =>
    r.roomNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-4xl rounded-[2rem] p-0 overflow-hidden bg-card border shadow-2xl">
        <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-8 border-b">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/20 text-primary rounded-xl">
                  <Bed className="size-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight text-secondary">
                    Gestion des Chambres
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground mt-1 text-sm">
                    Gérez les chambres et salles disponibles avec leurs types associés.
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
            <h4 className="text-sm font-semibold mb-4 text-foreground">Ajouter une nouvelle chambre</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">N° / Nom</label>
                <Input
                  placeholder="Ex: 101, Salle A..."
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Type</label>
                <select
                  value={newIdRoomType}
                  onChange={(e) => setNewIdRoomType(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3 h-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Sélectionner...</option>
                  {roomTypes.map((rt) => (
                    <option key={rt.idRoomType} value={rt.idRoomType}>{rt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Description</label>
                <Input
                  placeholder="Infos complémentaires..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="bg-background"
                />
              </div>
              <Button onClick={handleAdd} disabled={!newRoomNumber.trim() || !newIdRoomType} className="gap-2 rounded-xl h-10 w-full md:w-auto md:justify-center">
                <Plus className="size-4" /> Ajouter
              </Button>
            </div>
          </div>

                    <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
                Aucune chambre trouvée.
              </div>
            ) : (
              filteredData.map((item: any) => (
                <div key={item.idRoom} className="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors group">
                  {editingId === item.idRoom ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                      <Input value={editRoomNumber} onChange={(e) => setEditRoomNumber(e.target.value)} className="h-9" placeholder="Numéro" />
                      <select
                        value={editIdRoomType}
                        onChange={(e) => setEditIdRoomType(e.target.value)}
                        className="w-full bg-background border border-input rounded-md px-3 h-9 text-sm"
                      >
                        <option value="">Sélectionner...</option>
                        {roomTypes.map((rt) => (
                          <option key={rt.idRoomType} value={rt.idRoomType}>{rt.label}</option>
                        ))}
                      </select>
                      <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="h-9" placeholder="Description" />
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={saveEdit} className="text-green-600"><Check className="size-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={cancelEdit}><X className="size-4" /></Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="font-semibold text-foreground w-1/4 truncate">{item.roomNumber}</div>
                        <div className="text-sm text-muted-foreground w-1/4">
                          {roomTypes.find(rt => rt.idRoomType === item.idRoomType)?.label || <span className="text-red-400">Inconnu</span>}
                        </div>
                        <div className="text-sm text-muted-foreground flex-1 truncate">{item.description || "-"}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(item)} className="opacity-0 group-hover:opacity-100"><Edit className="size-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => onDelete(item.idRoom)} className="opacity-0 group-hover:opacity-100 text-destructive"><Trash2 className="size-4" /></Button>
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
      </DialogContent>
    </Dialog>
  );
}
