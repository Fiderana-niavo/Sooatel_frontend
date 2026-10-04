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
import Pagination from "@/components/ui/Pagination/pagination";
import { Layers, Edit, Trash2, Plus, X, Check, Search } from "lucide-react";
import type { ItemType } from "../types";

import { useQuery } from "@tanstack/react-query";
import { ItemTypeService } from "../services";

interface ItemTypesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: Partial<ItemType>) => void;
  onEdit: (id: string, data: Partial<ItemType>) => void;
  onDelete: (id: string) => void;
}

export function ItemTypesModal({
  isOpen,
  onClose,
  onAdd,
  onEdit,
  onDelete,
}: ItemTypesModalProps) {
  const [newLabel, setNewLabel] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleAdd = () => {
    if (newLabel.trim()) {
      onAdd({
        label: newLabel.trim(),
        description: newDescription.trim() || null,
      } as any);
      setNewLabel("");
      setNewDescription("");
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.idProductType);
    setEditLabel(item.label || "");
    setEditDescription(item.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = () => {
    if (editLabel.trim() && editingId) {
      onEdit(editingId, {
        label: editLabel.trim(),
        description: editDescription.trim() || null,
      } as any);
      setEditingId(null);
    }
  };

  const { data: paginatedDataResult, isLoading } = useQuery({
    queryKey: ["item-types-paginated", currentPage, search],
    queryFn: () =>
      ItemTypeService.getAllPaginated({
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
        className="max-w-4xl rounded-[2rem] p-0 overflow-hidden bg-card border shadow-2xl"
      >
        <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-8 border-b">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/20 text-primary rounded-xl">
                  <Layers className="size-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight text-secondary">
                    Types d'Articles
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground mt-1 text-sm">
                    Gérez les types de produits/articles.
                  </DialogDescription>
                </div>
              </div>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
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
          <div className="bg-muted/10 p-5 rounded-2xl border border-border/50">
            <h4 className="text-sm font-semibold mb-4 text-foreground">
              Nouveau type
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Nom (Label)
                </label>
                <Input
                  placeholder="Ex: Boisson"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Description
                </label>
                <Input
                  placeholder="Infos..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="bg-background"
                />
              </div>
              <Button
                onClick={handleAdd}
                disabled={!newLabel.trim()}
                className="gap-2 rounded-xl h-10 w-full"
              >
                <Plus className="size-4" /> Ajouter
              </Button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
                Chargement...
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
                Aucun type.
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-4 rounded-tl-2xl w-1/3">
                          Nom (Label)
                        </th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4 text-right rounded-tr-2xl w-24">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {paginatedData.map((item: any) => (
                        <tr
                          key={item.idProductType}
                          className="hover:bg-muted/30 transition-colors group"
                        >
                          {editingId === item.idProductType ? (
                            <td colSpan={3} className="px-6 py-2">
                              <div className="flex items-center gap-3">
                                <Input
                                  value={editLabel}
                                  onChange={(e) => setEditLabel(e.target.value)}
                                  className="h-9 w-1/3"
                                  placeholder="Nom"
                                />
                                <Input
                                  value={editDescription}
                                  onChange={(e) =>
                                    setEditDescription(e.target.value)
                                  }
                                  className="h-9 flex-1"
                                  placeholder="Description"
                                />
                                <div className="flex justify-end gap-1 w-24">
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
                              <td className="px-6 py-4 font-semibold text-foreground truncate">
                                {item.label}
                              </td>
                              <td className="px-6 py-4 text-muted-foreground truncate">
                                {item.description || "-"}
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
                                    onClick={() => onDelete(item.idProductType)}
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

        <DialogFooter className="p-4 bg-muted/10 border-t">
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
