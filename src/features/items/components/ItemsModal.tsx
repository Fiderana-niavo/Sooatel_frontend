import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { Package, Edit, Trash2, Plus, X, Check, Search, Eye, MoreVertical, PowerOff, Power } from "lucide-react";
import type { Item } from "../types";
import type { ItemType } from "../../item-types/types";
import type { UnitOfMeasure } from "../../unit-of-measures/types";

interface ItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Item[];
  itemTypes: ItemType[];
  unitOfMeasures: UnitOfMeasure[];
  onAdd: (data: Partial<Item>) => void;
  onEdit: (id: string, data: Partial<Item>) => void;
  onDelete: (id: string) => void;
}

export function ItemsModal({ isOpen, onClose, data, itemTypes, unitOfMeasures, onAdd, onEdit, onDelete }: ItemsModalProps) {
  const [newLabel, setNewLabel] = useState("");
  const [newIdProductType, setNewIdProductType] = useState("");
  const [newIdUnit, setNewIdUnit] = useState("");
  const [newMinStock, setNewMinStock] = useState("");
  const [newReorderQuantity, setNewReorderQuantity] = useState("");
  const [newIsPerishable, setNewIsPerishable] = useState(false);
  const [newIsProduced, setNewIsProduced] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const [editLabel, setEditLabel] = useState("");
  const [editIdProductType, setEditIdProductType] = useState("");
  const [editIdUnit, setEditIdUnit] = useState("");
  const [editMinStock, setEditMinStock] = useState("");
  const [editReorderQuantity, setEditReorderQuantity] = useState("");
  const [editIsPerishable, setEditIsPerishable] = useState(false);
  const [editIsProduced, setEditIsProduced] = useState(false);
  const [editDescription, setEditDescription] = useState("");

  const [search, setSearch] = useState("");

  const handleAdd = () => {
    if (newLabel.trim() && newIdProductType && newIdUnit) {
      onAdd({
        label: newLabel.trim(),
        idProductType: newIdProductType,
        idUnit: newIdUnit,
        minimumStockLevel: newMinStock ? parseFloat(newMinStock) : 0,
        reorderQuantity: newReorderQuantity ? parseFloat(newReorderQuantity) : null,
        isPerishable: newIsPerishable,
        isProduced: newIsProduced,
        status: 0,
        description: newDescription.trim() || null,
      } as any);
      setNewLabel("");
      setNewIdProductType("");
      setNewIdUnit("");
      setNewMinStock("");
      setNewReorderQuantity("");
      setNewIsPerishable(false);
      setNewIsProduced(false);
      setNewDescription("");
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.idItem);
    setEditLabel(item.label || "");
    setEditIdProductType(item.idProductType || "");
    setEditIdUnit(item.idUnit || "");
    setEditMinStock(item.minimumStockLevel?.toString() || "");
    setEditReorderQuantity(item.reorderQuantity?.toString() || "");
    setEditIsPerishable(item.isPerishable || false);
    setEditIsProduced(item.isProduced || false);
    setEditDescription(item.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = () => {
    if (editLabel.trim() && editingId) {
      onEdit(editingId, {
        label: editLabel.trim(),
        idProductType: editIdProductType,
        idUnit: editIdUnit,
        minimumStockLevel: editMinStock ? parseFloat(editMinStock) : 0,
        reorderQuantity: editReorderQuantity ? parseFloat(editReorderQuantity) : null,
        isPerishable: editIsPerishable,
        isProduced: editIsProduced,
        description: editDescription.trim() || null,
      } as any);
      setEditingId(null);
    }
  };

  const handleToggleStatus = (item: any) => {
    onEdit(item.idItem, {
      status: item.status === 0 ? -1 : 0
    } as any);
  };

  const filteredData = data.filter((r) => r.label?.toLowerCase().includes(search.toLowerCase()));

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-5xl rounded-[2rem] p-0 overflow-hidden bg-card border shadow-2xl">
        <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-8 border-b">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/20 text-primary rounded-xl">
                  <Package className="size-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight text-secondary">
                    Articles & Inventaire
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground mt-1 text-sm">
                    Gérez tous vos articles de stock (ingrédients, boissons...).
                  </DialogDescription>
                </div>
              </div>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input placeholder="Rechercher par référence..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-64 bg-background" />
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar max-h-[calc(95vh-150px)]">
          <div className="bg-muted/10 p-5 rounded-2xl border border-border/50 shrink-0">
            <h4 className="text-sm font-semibold mb-4 text-foreground">Ajouter un Article</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Nom (Label)</label>
                <Input placeholder="Ex: Farine de blé..." value={newLabel} onChange={(e) => setNewLabel(e.target.value)} className="bg-background" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Type d'article</label>
                <select value={newIdProductType} onChange={(e) => setNewIdProductType(e.target.value)} className="w-full bg-background border border-input rounded-xl px-3 h-10 text-sm">
                  <option value="">Sélectionner...</option>
                  {itemTypes.map(it => <option key={it.idProductType} value={it.idProductType}>{it.label}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Unité de Mesure</label>
                <select value={newIdUnit} onChange={(e) => setNewIdUnit(e.target.value)} className="w-full bg-background border border-input rounded-xl px-3 h-10 text-sm">
                  <option value="">Sélectionner...</option>
                  {unitOfMeasures.map(u => <option key={u.idUnit} value={u.idUnit}>{u.label} ({u.symbol})</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Stock Min.</label>
                <Input type="number" placeholder="ex : 5" value={newMinStock} onChange={(e) => setNewMinStock(e.target.value)} className="bg-background" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Re-commande</label>
                <Input type="number" placeholder="Qté..." value={newReorderQuantity} onChange={(e) => setNewReorderQuantity(e.target.value)} className="bg-background" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Description</label>
                <Input placeholder="Détails..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="bg-background" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Options</label>
                <div className="flex flex-wrap gap-2 h-10 items-center">
                  <label className="flex items-center gap-2 text-sm bg-background border px-3 rounded-lg h-full cursor-pointer hover:bg-muted/50 transition-colors">
                    <input type="checkbox" checked={newIsPerishable} onChange={(e) => setNewIsPerishable(e.target.checked)} />
                    Périssable
                  </label>
                  <label className="flex items-center gap-2 text-sm bg-background border px-3 rounded-lg h-full cursor-pointer hover:bg-muted/50 transition-colors">
                    <input type="checkbox" checked={newIsProduced} onChange={(e) => setNewIsProduced(e.target.checked)} />
                    Produit interne
                  </label>
                </div>
              </div>

              <Button onClick={handleAdd} disabled={!newLabel.trim() || !newIdProductType || !newIdUnit} className="gap-2 rounded-xl h-10 w-full md:col-span-3">
                <Plus className="size-4" /> Ajouter
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
                Aucun article trouvé.
              </div>
            ) : (
              filteredData.map((item: any) => (
                <div key={item.idItem} className="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors group">
                  {editingId === item.idItem ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                        <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="h-9" placeholder="Nom" />
                        <select value={editIdProductType} onChange={(e) => setEditIdProductType(e.target.value)} className="w-full bg-background border border-input rounded-md px-3 h-9 text-sm">
                          <option value="">Type...</option>
                          {itemTypes.map(it => <option key={it.idProductType} value={it.idProductType}>{it.label}</option>)}
                        </select>
                        <select value={editIdUnit} onChange={(e) => setEditIdUnit(e.target.value)} className="w-full bg-background border border-input rounded-md px-3 h-9 text-sm">
                          <option value="">Unité...</option>
                          {unitOfMeasures.map(u => <option key={u.idUnit} value={u.idUnit}>{u.symbol}</option>)}
                        </select>
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={saveEdit} className="text-green-600"><Check className="size-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={cancelEdit}><X className="size-4" /></Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                        <Input type="number" value={editMinStock} onChange={(e) => setEditMinStock(e.target.value)} className="h-9" placeholder="Stock Min." />
                        <Input type="number" value={editReorderQuantity} onChange={(e) => setEditReorderQuantity(e.target.value)} className="h-9" placeholder="Re-commande" />
                        <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="h-9" placeholder="Description" />
                        <div className="md:col-span-2 flex items-center gap-2">
                          <label className="flex items-center gap-1.5 text-xs bg-background border px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted/50">
                            <input type="checkbox" checked={editIsPerishable} onChange={(e) => setEditIsPerishable(e.target.checked)} />
                            Périssable
                          </label>
                          <label className="flex items-center gap-1.5 text-xs bg-background border px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted/50">
                            <input type="checkbox" checked={editIsProduced} onChange={(e) => setEditIsProduced(e.target.checked)} />
                            Produit interne
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="font-semibold text-foreground w-1/5 truncate">{item.ref}</div>
                          <div className="text-sm font-medium w-1/4 truncate">{item.label}</div>
                          <div className="text-sm text-muted-foreground w-1/5 truncate">
                            {itemTypes.find(it => it.idProductType === item.idProductType)?.label || "-"}
                          </div>
                          <div className="text-sm text-muted-foreground w-1/5 truncate">
                            {unitOfMeasures.find(u => u.idUnit === item.idUnit)?.label || "-"}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 relative">
                          <Button size="icon" variant="ghost" onClick={() => setMenuOpenId(menuOpenId === item.idItem ? null : item.idItem)}>
                            <MoreVertical className="size-4" />
                          </Button>

                          {menuOpenId === item.idItem && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setMenuOpenId(null)}></div>
                              <div className="absolute right-0 bottom-full mb-1 w-48 bg-card border border-border/50 shadow-xl rounded-xl p-1 z-50 animate-in zoom-in-95 origin-bottom-right">
                                <button onClick={() => { setViewingId(viewingId === item.idItem ? null : item.idItem); setMenuOpenId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 rounded-lg text-left">
                                  <Eye className="size-4 text-muted-foreground" /> {viewingId === item.idItem ? "Masquer détails" : "Détails"}
                                </button>
                                <button onClick={() => { startEdit(item); setMenuOpenId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 rounded-lg text-left">
                                  <Edit className="size-4 text-blue-500" /> Modifier
                                </button>
                                <button onClick={() => { handleToggleStatus(item); setMenuOpenId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 rounded-lg text-left">
                                  {item.status === 0 ? <><PowerOff className="size-4 text-orange-500" /> Rendre inactif</> : <><Power className="size-4 text-emerald-500" /> Rendre actif</>}
                                </button>
                                <div className="h-px bg-border/50 my-1"></div>
                                <button onClick={() => { onDelete(item.idItem); setMenuOpenId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-destructive/10 text-destructive rounded-lg text-left">
                                  <Trash2 className="size-4" /> Supprimer
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {viewingId === item.idItem && (
                        <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-muted/5 p-4 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                          <div><span className="text-muted-foreground block text-xs uppercase mb-1">Stock Actuel</span> <span className="font-semibold text-base">{item.quantity ?? 0}</span></div>
                          <div><span className="text-muted-foreground block text-xs uppercase mb-1">Stock Min.</span> <span className="font-semibold text-base">{item.minimumStockLevel}</span></div>
                          <div><span className="text-muted-foreground block text-xs uppercase mb-1">Re-commande</span> <span className="font-semibold text-base">{item.reorderQuantity ?? "-"}</span></div>
                          <div><span className="text-muted-foreground block text-xs uppercase mb-1">Statut</span> <span className="font-semibold text-base">{item.status === 0 ? <span className="text-emerald-500">Actif</span> : <span className="text-destructive">Inactif</span>}</span></div>
                          <div><span className="text-muted-foreground block text-xs uppercase mb-1">Périssable</span> <span className="font-semibold text-base">{item.isPerishable ? "Oui" : "Non"}</span></div>
                          <div><span className="text-muted-foreground block text-xs uppercase mb-1">Produit interne</span> <span className="font-semibold text-base">{item.isProduced ? "Oui" : "Non"}</span></div>
                          <div className="md:col-span-2"><span className="text-muted-foreground block text-xs uppercase mb-1">Description</span> <span className="font-semibold">{item.description || "-"}</span></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="p-4 bg-muted/10 border-t shrink-0">
          <Button onClick={onClose} variant="outline" className="w-full sm:w-auto rounded-xl">Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
