import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { CurrencyInput } from "@/components/ui/Inputs/CurrencyInput";
import Pagination from "@/components/ui/Pagination/pagination";
import {
  Coffee,
  Edit,
  Trash2,
  Plus,
  X,
  Check,
  Filter,
  Search,
} from "lucide-react";
import type { MenuItem } from "../types";
import type { MenuCategory } from "../../menu-categories/types";
import type { Item } from "../../items/types/item.type";
import { useQuery } from "@tanstack/react-query";
import { MenuItemService } from "../services";

interface MenuItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  categories: MenuCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  onAdd: (data: Partial<MenuItem>) => void;
  onEdit: (id: string, data: Partial<MenuItem>) => void;
  onDelete: (id: string) => void;
}

export function MenuItemsModal({
  isOpen,
  onClose,
  items,
  categories,
  selectedCategory,
  onCategoryChange,
  onAdd,
  onEdit,
  onDelete,
}: MenuItemsModalProps) {
  const [newIdItem, setNewIdItem] = useState("");
  const [newSalePrice, setNewSalePrice] = useState("");
  const [newRecipeCost, setNewRecipeCost] = useState("");
  const [newIdCategory, setNewIdCategory] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editIdItem, setEditIdItem] = useState("");
  const [editSalePrice, setEditSalePrice] = useState("");
  const [editRecipeCost, setEditRecipeCost] = useState("");
  const [editIdCategory, setEditIdCategory] = useState("");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleAdd = () => {
    if (newIdItem && newSalePrice && newIdCategory) {
      onAdd({
        idItem: newIdItem,
        salePrice: parseFloat(newSalePrice),
        recipeCost: newRecipeCost ? parseFloat(newRecipeCost) : undefined,
        idCategory: newIdCategory,
      } as any);
      setNewIdItem("");
      setNewSalePrice("");
      setNewRecipeCost("");
      setNewIdCategory("");
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.idMenu);
    setEditIdItem(item.idItem || item.item?.idItem || "");
    setEditSalePrice(item.salePrice?.toString() || "");
    setEditRecipeCost(item.recipeCost?.toString() || "");
    setEditIdCategory(item.idCategory || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = () => {
    if (editIdItem && editSalePrice && editIdCategory && editingId) {
      onEdit(editingId, {
        idItem: editIdItem,
        salePrice: parseFloat(editSalePrice),
        recipeCost: editRecipeCost ? parseFloat(editRecipeCost) : undefined,
        idCategory: editIdCategory,
      } as any);
      setEditingId(null);
    }
  };

  const { data: paginatedDataResult, isLoading } = useQuery({
    queryKey: ["menu-items-paginated", currentPage, search, selectedCategory],
    queryFn: () =>
      MenuItemService.getAllPaginated({
        page: currentPage,
        limit: itemsPerPage,
        search,
        idCategory: selectedCategory || undefined,
      }),
    enabled: isOpen,
  });

  const paginatedData = paginatedDataResult?.records || [];
  const totalPages = paginatedDataResult?.total
    ? Math.ceil(paginatedDataResult.total / itemsPerPage)
    : 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-5xl rounded-[2rem] p-0 overflow-hidden bg-card border shadow-2xl"
      >
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
                  <Input
                    placeholder="Rechercher par nom..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9 w-64 bg-background"
                  />
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div
          className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar"
          style={{ maxHeight: "calc(90vh - 150px)" }}
        >
          <div className="shrink-0 bg-muted/10 p-5 rounded-2xl border border-border/50">
            <h4 className="text-sm font-semibold mb-4 text-foreground">
              Nouveau Plat
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Article (Stock lié)
                </label>
                <select
                  value={newIdItem}
                  onChange={(e) => setNewIdItem(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3 h-10 text-sm"
                >
                  <option value="">Sélectionner...</option>
                  {items.map((i) => (
                    <option key={i.idItem} value={i.idItem}>
                      {i.label + (i.unit?.symbol ? ` (${i.unit.symbol})` : "")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Catégorie
                </label>
                <select
                  value={newIdCategory}
                  onChange={(e) => setNewIdCategory(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3 h-10 text-sm"
                >
                  <option value="">Sélectionner...</option>
                  {categories.map((c) => (
                    <option key={c.idCategory} value={c.idCategory}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Prix (Ar)
                </label>
                <CurrencyInput
                  placeholder="0"
                  value={newSalePrice ? Number(newSalePrice) : undefined}
                  onChange={(val) =>
                    setNewSalePrice(val !== undefined ? String(val) : "")
                  }
                  className="bg-background"
                />
              </div>
              <Button
                onClick={handleAdd}
                disabled={!newIdItem || !newSalePrice || !newIdCategory}
                className="gap-2 rounded-xl h-10 w-full"
              >
                <Plus className="size-4" /> Ajouter
              </Button>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 mt-2">
            <h4 className="text-sm font-semibold text-foreground">
              Plats existants
            </h4>
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  onCategoryChange(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-48 bg-background border border-input rounded-md px-3 h-8 text-sm focus-visible:outline-none"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat.idCategory} value={cat.idCategory}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
                Chargement...
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
                Aucun plat trouvé.
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-4 rounded-tl-2xl">Réf</th>
                        <th className="px-6 py-4">Article lié</th>
                        <th className="px-6 py-4">Catégorie</th>
                        <th className="px-6 py-4 text-right">Prix (Ar)</th>
                        <th className="px-6 py-4 text-right rounded-tr-2xl w-24">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {paginatedData.map((item: any) => (
                        <tr
                          key={item.idMenu}
                          className="hover:bg-muted/30 transition-colors group"
                        >
                          {editingId === item.idMenu ? (
                            <td colSpan={5} className="px-6 py-2">
                              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                                <select
                                  value={editIdItem}
                                  onChange={(e) =>
                                    setEditIdItem(e.target.value)
                                  }
                                  className="md:col-span-2 w-full bg-background border border-input rounded-md px-3 h-9 text-sm"
                                >
                                  <option value="">Article...</option>
                                  {items.map((i) => (
                                    <option key={i.idItem} value={i.idItem}>
                                      {i.label +
                                        (i.unit?.symbol
                                          ? ` (${i.unit.symbol})`
                                          : "")}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={editIdCategory}
                                  onChange={(e) =>
                                    setEditIdCategory(e.target.value)
                                  }
                                  className="w-full bg-background border border-input rounded-md px-3 h-9 text-sm"
                                >
                                  <option value="">Catégorie...</option>
                                  {categories.map((c) => (
                                    <option
                                      key={c.idCategory}
                                      value={c.idCategory}
                                    >
                                      {c.label}
                                    </option>
                                  ))}
                                </select>
                                <CurrencyInput
                                  value={
                                    editSalePrice
                                      ? Number(editSalePrice)
                                      : undefined
                                  }
                                  onChange={(val) =>
                                    setEditSalePrice(
                                      val !== undefined ? String(val) : "",
                                    )
                                  }
                                  className="h-9"
                                  placeholder="Prix"
                                />
                                <div className="flex justify-end gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={saveEdit}
                                    className="text-green-600 hover:text-green-600 hover:bg-green-600/10 rounded-full"
                                  >
                                    <Check className="size-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={cancelEdit}
                                    className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
                                  >
                                    <X className="size-4" />
                                  </Button>
                                </div>
                              </div>
                            </td>
                          ) : (
                            <>
                              <td className="px-6 py-4 font-semibold text-foreground truncate max-w-[120px]">
                                {item.ref}
                              </td>
                              <td className="px-6 py-4 text-muted-foreground truncate max-w-[200px]">
                                {item.item?.label ||
                                  items.find(
                                    (i) =>
                                      i.idItem ===
                                      (item.idItem || item.item?.idItem),
                                  )?.label ||
                                  "Article Inconnu"}
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
                                  {categories.find(
                                    (c) => c.idCategory === item.idCategory,
                                  )?.label || "Inconnu"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right font-semibold text-emerald-600 whitespace-nowrap">
                                {Number(item.salePrice).toLocaleString()} Ar
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => startEdit(item)}
                                    className="opacity-0 group-hover:opacity-100 text-primary hover:text-primary hover:bg-primary/10 rounded-full"
                                  >
                                    <Edit className="size-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => onDelete(item.idMenu)}
                                    className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center shrink-0">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        <DialogFooter className="p-4 bg-muted/10 border-t shrink-0">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full sm:w-auto rounded-xl"
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
