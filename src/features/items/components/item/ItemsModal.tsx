import { useState, Fragment } from "react";
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
import Pagination from "@/components/ui/Pagination/pagination";
import {
  Package,
  Edit,
  Trash2,
  Plus,
  X,
  Check,
  Search,
  Eye,
  PowerOff,
  Power,
} from "lucide-react";
import { ActionDropdown } from "@/components/ui/ActionDropdown/ActionDropdown";
import type { Item, CreateItemDto } from "../../types/item.type";
import type { ItemType } from "../../../item-types/types";
import type { UnitOfMeasure } from "../../../unit-of-measures/types";

import { useQuery } from "@tanstack/react-query";
import { ItemService } from "../../services/item.service";

interface ItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTypes: ItemType[];
  unitOfMeasures: UnitOfMeasure[];
  onAdd: (data: CreateItemDto) => void;
  onEdit: (id: string, data: Partial<Item>) => void;
  onDelete: (id: string) => void;
}

export function ItemsModal({
  isOpen,
  onClose,
  itemTypes,
  unitOfMeasures,
  onAdd,
  onEdit,
  onDelete,
}: ItemsModalProps) {
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

  const [editLabel, setEditLabel] = useState("");
  const [editIdProductType, setEditIdProductType] = useState("");
  const [editIdUnit, setEditIdUnit] = useState("");
  const [editMinStock, setEditMinStock] = useState("");
  const [editReorderQuantity, setEditReorderQuantity] = useState("");
  const [editIsPerishable, setEditIsPerishable] = useState(false);
  const [editIsProduced, setEditIsProduced] = useState(false);
  const [editDescription, setEditDescription] = useState("");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleAdd = () => {
    if (newLabel.trim() && newIdProductType && newIdUnit) {
      onAdd({
        label: newLabel.trim(),
        idProductType: newIdProductType,
        idUnit: newIdUnit,
        minimumStockLevel: newMinStock ? parseFloat(newMinStock) : 0,
        reorderQuantity: newReorderQuantity
          ? parseFloat(newReorderQuantity)
          : undefined,
        isPerishable: newIsPerishable,
        isProduced: newIsProduced,
        status: 0,
        description: newDescription.trim() || undefined,
      });
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
    setEditMinStock(
      item.minimumStockLevel != null && item.minimumStockLevel !== 0
        ? item.minimumStockLevel.toString()
        : "",
    );
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
        reorderQuantity: editReorderQuantity
          ? parseFloat(editReorderQuantity)
          : null,
        isPerishable: editIsPerishable,
        isProduced: editIsProduced,
        description: editDescription.trim() || null,
      } as any);
      setEditingId(null);
    }
  };

  const handleToggleStatus = (item: any) => {
    onEdit(item.idItem, {
      status: item.status === 0 ? -1 : 0,
    } as any);
  };

  const { data: paginatedDataResult, isLoading } = useQuery({
    queryKey: ["items-paginated", currentPage, search],
    queryFn: () =>
      ItemService.getAllPaginated({
        page: currentPage,
        limit: itemsPerPage,
        search,
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
          </DialogHeader>
        </div>

        <div
          className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar"
          style={{ maxHeight: "calc(90vh - 150px)" }}
        >
          <div className="bg-muted/10 p-5 rounded-2xl border border-border/50 shrink-0">
            <h4 className="text-sm font-semibold mb-4 text-foreground">
              Ajouter un Article
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Nom (Label)
                </label>
                <Input
                  placeholder="Ex: Farine de blé..."
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Type d'article
                </label>
                <select
                  value={newIdProductType}
                  onChange={(e) => setNewIdProductType(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3 h-10 text-sm"
                >
                  <option value="">Sélectionner...</option>
                  {itemTypes.map((it) => (
                    <option key={it.idProductType} value={it.idProductType}>
                      {it.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Unité de Mesure
                </label>
                <select
                  value={newIdUnit}
                  onChange={(e) => setNewIdUnit(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3 h-10 text-sm"
                >
                  <option value="">Sélectionner...</option>
                  {unitOfMeasures.map((u) => (
                    <option key={u.idUnit} value={u.idUnit}>
                      {u.label} ({u.symbol})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Stock Min.
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="ex : 5"
                  value={newMinStock}
                  onChange={(e) => setNewMinStock(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Description
                </label>
                <Input
                  placeholder="Détails..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Options
                </label>
                <div className="grid grid-cols-2 gap-4 h-10 items-center">
                  <label className="flex items-center justify-center gap-2 text-sm bg-background border px-3 rounded-md h-full cursor-pointer hover:bg-muted/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={newIsPerishable}
                      onChange={(e) => setNewIsPerishable(e.target.checked)}
                    />
                    Périssable
                  </label>
                  <label className="flex items-center justify-center gap-2 text-sm bg-background border px-3 rounded-md h-full cursor-pointer hover:bg-muted/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={newIsProduced}
                      onChange={(e) => setNewIsProduced(e.target.checked)}
                    />
                    Produit interne
                  </label>
                </div>
              </div>
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Re-commande
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Qté..."
                  value={newReorderQuantity}
                  onChange={(e) => setNewReorderQuantity(e.target.value)}
                  className="bg-background"
                />
              </div>

              <Button
                type="button"
                onClick={handleAdd}
                disabled={!newLabel.trim() || !newIdProductType || !newIdUnit}
                className="gap-2 rounded-xl h-10 w-full md:col-span-5 mt-2"
              >
                <Plus className="size-4" /> Ajouter
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
                Chargement...
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
                Aucun article trouvé.
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-4 rounded-tl-2xl">Réf</th>
                        <th className="px-6 py-4">Nom (Label)</th>
                        <th className="px-6 py-4 text-center">Unité</th>
                        <th className="px-6 py-4 whitespace-nowrap">Stock</th>
                        <th className="px-6 py-4 text-right rounded-tr-2xl w-16">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {paginatedData.map((item: any) => (
                        <Fragment key={item.idItem}>
                          <tr className="hover:bg-muted/30 transition-colors group">
                            {editingId === item.idItem ? (
                              <td colSpan={5} className="px-6 py-4">
                                <div className="space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                                    <div className="space-y-1 md:col-span-2">
                                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                                        Nom
                                      </label>
                                      <Input
                                        value={editLabel}
                                        onChange={(e) =>
                                          setEditLabel(e.target.value)
                                        }
                                        className="h-9"
                                        placeholder="Nom"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                                        Type
                                      </label>
                                      <select
                                        value={editIdProductType}
                                        onChange={(e) =>
                                          setEditIdProductType(e.target.value)
                                        }
                                        className="w-full bg-background border border-input rounded-md px-3 h-9 text-sm"
                                      >
                                        <option value="">Type...</option>
                                        {itemTypes.map((it) => (
                                          <option
                                            key={it.idProductType}
                                            value={it.idProductType}
                                          >
                                            {it.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                                        Unité
                                      </label>
                                      <select
                                        value={editIdUnit}
                                        onChange={(e) =>
                                          setEditIdUnit(e.target.value)
                                        }
                                        className="w-full bg-background border border-input rounded-md px-3 h-9 text-sm"
                                      >
                                        <option value="">Unité...</option>
                                        {unitOfMeasures.map((u) => (
                                          <option
                                            key={u.idUnit}
                                            value={u.idUnit}
                                          >
                                            {u.symbol}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                                        Stock Min.
                                      </label>
                                      <Input
                                        type="text"
                                        inputMode="numeric"
                                        value={editMinStock}
                                        onChange={(e) =>
                                          setEditMinStock(e.target.value)
                                        }
                                        className="h-9"
                                        placeholder="-"
                                      />
                                    </div>

                                    <div className="space-y-1 md:col-span-2 mt-1">
                                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                                        Description
                                      </label>
                                      <Input
                                        value={editDescription}
                                        onChange={(e) =>
                                          setEditDescription(e.target.value)
                                        }
                                        className="h-9"
                                        placeholder="Description"
                                      />
                                    </div>
                                    <div className="space-y-1 md:col-span-2 mt-1">
                                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                                        Options
                                      </label>
                                      <div className="grid grid-cols-2 gap-3 h-9 items-center">
                                        <label className="flex items-center justify-center gap-1.5 text-xs bg-background border px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted/50 h-full">
                                          <input
                                            type="checkbox"
                                            checked={editIsPerishable}
                                            onChange={(e) =>
                                              setEditIsPerishable(
                                                e.target.checked,
                                              )
                                            }
                                          />
                                          Périssable
                                        </label>
                                        <label className="flex items-center justify-center gap-1.5 text-xs bg-background border px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted/50 h-full">
                                          <input
                                            type="checkbox"
                                            checked={editIsProduced}
                                            onChange={(e) =>
                                              setEditIsProduced(
                                                e.target.checked,
                                              )
                                            }
                                          />
                                          Produit interne
                                        </label>
                                      </div>
                                    </div>
                                    <div className="space-y-1 mt-1">
                                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                                        Re-commande
                                      </label>
                                      <Input
                                        type="text"
                                        inputMode="numeric"
                                        value={editReorderQuantity}
                                        onChange={(e) =>
                                          setEditReorderQuantity(e.target.value)
                                        }
                                        className="h-9"
                                        placeholder="-"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-border/50">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={cancelEdit}
                                      className="h-8 gap-1 text-muted-foreground"
                                    >
                                      <X className="size-3.5" /> Annuler
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={saveEdit}
                                      className="h-8 gap-1 text-green-600 bg-green-600/10 hover:bg-green-600/20"
                                    >
                                      <Check className="size-3.5" /> Enregistrer
                                    </Button>
                                  </div>
                                </div>
                              </td>
                            ) : (
                              <>
                                <td className="px-6 py-4 font-semibold text-foreground truncate max-w-[120px]">
                                  {item.ref}
                                </td>
                                <td className="px-6 py-4 font-medium truncate max-w-[200px]">
                                  {item.label}
                                </td>
                                <td className="px-6 py-4 text-muted-foreground text-center truncate max-w-[100px]">
                                  {unitOfMeasures.find(
                                    (u) => u.idUnit === item.idUnit,
                                  )?.symbol || "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="font-semibold text-primary">
                                    {item.quantity ?? 0}
                                  </span>{" "}
                                  en stock
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <ActionDropdown
                                    items={[
                                      {
                                        label:
                                          viewingId === item.idItem
                                            ? "Masquer détails"
                                            : "Détails",
                                        icon: (
                                          <Eye className="size-4 text-muted-foreground" />
                                        ),
                                        onClick: () =>
                                          setViewingId(
                                            viewingId === item.idItem
                                              ? null
                                              : item.idItem,
                                          ),
                                      },
                                      {
                                        label: "Modifier",
                                        icon: (
                                          <Edit className="size-4 text-blue-500" />
                                        ),
                                        onClick: () => startEdit(item),
                                      },
                                      {
                                        label:
                                          item.status === 0
                                            ? "Rendre inactif"
                                            : "Rendre actif",
                                        icon:
                                          item.status === 0 ? (
                                            <PowerOff className="size-4 text-orange-500" />
                                          ) : (
                                            <Power className="size-4 text-emerald-500" />
                                          ),
                                        onClick: () => handleToggleStatus(item),
                                      },
                                      {
                                        label: "Supprimer",
                                        icon: <Trash2 className="size-4" />,
                                        onClick: () => onDelete(item.idItem),
                                        className:
                                          "text-destructive hover:bg-destructive/10",
                                      },
                                    ]}
                                  />
                                </td>
                              </>
                            )}
                          </tr>

                          {viewingId === item.idItem && (
                            <tr className="bg-muted/5">
                              <td
                                colSpan={5}
                                className="px-6 py-4 border-t border-border/50"
                              >
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm animate-in fade-in zoom-in-95 duration-200">
                                  <div>
                                    <span className="text-muted-foreground block text-xs uppercase mb-1">
                                      Type d'article
                                    </span>{" "}
                                    <span className="font-semibold text-base">
                                      {itemTypes.find(
                                        (it) =>
                                          it.idProductType ===
                                          item.idProductType,
                                      )?.label || "-"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block text-xs uppercase mb-1">
                                      Unité complète
                                    </span>{" "}
                                    <span className="font-semibold text-base">
                                      {unitOfMeasures.find(
                                        (u) => u.idUnit === item.idUnit,
                                      )?.label || "-"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block text-xs uppercase mb-1">
                                      Stock Actuel
                                    </span>{" "}
                                    <span className="font-semibold text-base">
                                      {item.quantity ?? 0}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block text-xs uppercase mb-1">
                                      Stock Min.
                                    </span>{" "}
                                    <span className="font-semibold text-base">
                                      {item.minimumStockLevel}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block text-xs uppercase mb-1">
                                      Re-commande
                                    </span>{" "}
                                    <span className="font-semibold text-base">
                                      {item.reorderQuantity ?? "-"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block text-xs uppercase mb-1">
                                      Statut
                                    </span>{" "}
                                    <span className="font-semibold text-base">
                                      {item.status === 0 ? (
                                        <span className="text-emerald-500">
                                          Actif
                                        </span>
                                      ) : (
                                        <span className="text-destructive">
                                          Inactif
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block text-xs uppercase mb-1">
                                      Périssable
                                    </span>{" "}
                                    <span className="font-semibold text-base">
                                      {item.isPerishable ? "Oui" : "Non"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block text-xs uppercase mb-1">
                                      Produit interne
                                    </span>{" "}
                                    <span className="font-semibold text-base">
                                      {item.isProduced ? "Oui" : "Non"}
                                    </span>
                                  </div>
                                  <div className="md:col-span-2">
                                    <span className="text-muted-foreground block text-xs uppercase mb-1">
                                      Description
                                    </span>{" "}
                                    <span className="font-semibold">
                                      {item.description || "-"}
                                    </span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
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
