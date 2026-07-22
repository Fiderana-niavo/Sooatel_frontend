import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { Coffee, Edit, Trash2, Plus, X, Check, Filter, Search } from "lucide-react";
import type { MenuItem } from "../types";
import type { MenuCategory } from "../../menu-categories/types";
import type { Item } from "../../items/types";

interface MenuItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MenuItem[];
  items: Item[];
  categories: MenuCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  onAdd: (data: Partial<MenuItem>) => void;
  onEdit: (id: string, data: Partial<MenuItem>) => void;
  onDelete: (id: string) => void;
}

export function MenuItemsModal({ isOpen, onClose, data, items, categories, selectedCategory, onCategoryChange, onAdd, onEdit, onDelete }: MenuItemsModalProps) {
  const [newRef, setNewRef] = useState("");
  const [newIdItem, setNewIdItem] = useState("");
  const [newSalePrice, setNewSalePrice] = useState("");
  const [newRecipeCost, setNewRecipeCost] = useState("");
  const [newIdCategory, setNewIdCategory] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRef, setEditRef] = useState("");
  const [editIdItem, setEditIdItem] = useState("");
  const [editSalePrice, setEditSalePrice] = useState("");
  const [editRecipeCost, setEditRecipeCost] = useState("");
  const [editIdCategory, setEditIdCategory] = useState("");

  const [search, setSearch] = useState("");

  const handleAdd = () => {
    if (newRef.trim() && newIdItem && newSalePrice && newIdCategory) {
      onAdd({
        ref: newRef.trim(),
        idItem: newIdItem,
        salePrice: parseFloat(newSalePrice),
        recipeCost: newRecipeCost ? parseFloat(newRecipeCost) : undefined,
        idCategory: newIdCategory,
      } as any);
      setNewRef("");
      setNewIdItem("");
      setNewSalePrice("");
      setNewRecipeCost("");
      setNewIdCategory("");
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.idMenu);
    setEditRef(item.ref || "");
    setEditIdItem(item.idItem || "");
    setEditSalePrice(item.salePrice?.toString() || "");
    setEditRecipeCost(item.recipeCost?.toString() || "");
    setEditIdCategory(item.idCategory || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = () => {
    if (editRef.trim() && editIdItem && editSalePrice && editIdCategory && editingId) {
      onEdit(editingId, {
        ref: editRef.trim(),
        idItem: editIdItem,
        salePrice: parseFloat(editSalePrice),
        recipeCost: editRecipeCost ? parseFloat(editRecipeCost) : undefined,
        idCategory: editIdCategory,
      } as any);
      setEditingId(null);
    }
  };

  const filteredData = data.filter((r) => {
    const matchesSearch = r.ref?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory ? r.idCategory === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-5xl rounded-[2rem] p-0 overflow-hidden bg-card border shadow-2xl">
        <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-8 border-b">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/20 text-primary rounded-xl">
                  <Coffee className="size-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight text-secondary">
                    Plats du Menu
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground mt-1 text-sm">
                    Gérez les plats avec leurs prix et articles de stock liés.
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-64 bg-background" />
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-3 bg-muted/10 p-4 rounded-2xl border border-border/50">
            <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0 hidden md:block">
              <Filter className="size-4" />
            </div>
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Filtrer par Catégorie</label>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full bg-background border border-input rounded-xl px-3 h-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat.idCategory} value={cat.idCategory}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-muted/10 p-5 rounded-2xl border border-border/50">
            <h4 className="text-sm font-semibold mb-4 text-foreground">Nouveau Plat</h4>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Réf / Nom</label>
                <Input placeholder="Ex: Burger..." value={newRef} onChange={(e) => setNewRef(e.target.value)} className="bg-background" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Article (Stock lié)</label>
                <select value={newIdItem} onChange={(e) => setNewIdItem(e.target.value)} className="w-full bg-background border border-input rounded-xl px-3 h-10 text-sm">
                  <option value="">Sélectionner...</option>
                  {items.map((i) => <option key={i.idItem} value={i.idItem}>{i.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Catégorie</label>
                <select value={newIdCategory} onChange={(e) => setNewIdCategory(e.target.value)} className="w-full bg-background border border-input rounded-xl px-3 h-10 text-sm">
                  <option value="">Sélectionner...</option>
                  {categories.map((c) => <option key={c.idCategory} value={c.idCategory}>{c.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Prix (Ar)</label>
                <Input type="number" placeholder="0" value={newSalePrice} onChange={(e) => setNewSalePrice(e.target.value)} className="bg-background" />
              </div>
              <Button onClick={handleAdd} disabled={!newRef.trim() || !newIdItem || !newSalePrice || !newIdCategory} className="gap-2 rounded-xl h-10 w-full">
                <Plus className="size-4" /> Ajouter
              </Button>
            </div>
          </div>

          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
                Aucun plat trouvé.
              </div>
            ) : (
              filteredData.map((item: any) => (
                <div key={item.idMenu} className="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors group">
                  {editingId === item.idMenu ? (
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                      <Input value={editRef} onChange={(e) => setEditRef(e.target.value)} className="h-9" placeholder="Réf" />
                      <select value={editIdItem} onChange={(e) => setEditIdItem(e.target.value)} className="md:col-span-2 w-full bg-background border border-input rounded-md px-3 h-9 text-sm">
                        <option value="">Article...</option>
                        {items.map((i) => <option key={i.idItem} value={i.idItem}>{i.label}</option>)}
                      </select>
                      <select value={editIdCategory} onChange={(e) => setEditIdCategory(e.target.value)} className="w-full bg-background border border-input rounded-md px-3 h-9 text-sm">
                        <option value="">Catégorie...</option>
                        {categories.map((c) => <option key={c.idCategory} value={c.idCategory}>{c.label}</option>)}
                      </select>
                      <Input type="number" value={editSalePrice} onChange={(e) => setEditSalePrice(e.target.value)} className="h-9" placeholder="Prix" />
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={saveEdit} className="text-green-600"><Check className="size-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={cancelEdit}><X className="size-4" /></Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="font-semibold text-foreground w-1/5 truncate">{item.ref}</div>
                        <div className="text-sm text-muted-foreground w-1/5 truncate">
                          {items.find(i => i.idItem === item.idItem)?.label || "Article Inconnu"}
                        </div>
                        <div className="text-sm text-muted-foreground w-1/5 truncate">
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
                            {categories.find(c => c.idCategory === item.idCategory)?.label || "Inconnu"}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-emerald-600 flex-1 text-right pr-4">
                          {Number(item.salePrice).toLocaleString()} Ar
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(item)} className="opacity-0 group-hover:opacity-100"><Edit className="size-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => onDelete(item.idMenu)} className="opacity-0 group-hover:opacity-100 text-destructive"><Trash2 className="size-4" /></Button>
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
