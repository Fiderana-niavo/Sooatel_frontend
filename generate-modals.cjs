const fs = require('fs');
const path = require('path');

const basePath = 'f:/Stage/Sooatel/Projet_de_stage/Sooatel_frontend/src/features';

const entities = [
  { moduleName: 'events', entity: 'Event', id: 'idEvent', title: 'Événements', icon: 'Calendar', desc: 'Gérez les événements spéciaux.' },
  { moduleName: 'rooms', entity: 'Room', id: 'idRoom', title: 'Chambres/Salles', icon: 'Bed', desc: 'Gérez les chambres et salles disponibles.' },
  { moduleName: 'room-types', entity: 'RoomType', id: 'idRoomType', title: 'Types de Chambres', icon: 'BedDouble', desc: 'Définissez les catégories de chambres.' },
  { moduleName: 'product-prices', entity: 'ProductPrice', id: 'idProductPrice', title: 'Prix Spéciaux', icon: 'Tag', desc: 'Gérez les prix spécifiques des produits.' },
  { moduleName: 'items', entity: 'Item', id: 'idItem', title: 'Articles / Produits', icon: 'Box', desc: 'Gérez le stock et les articles.' },
  { moduleName: 'unit-of-measures', entity: 'UnitOfMeasure', id: 'idUnit', title: 'Unités de mesure', icon: 'Scale', desc: 'Gérez les unités (kg, litre, etc.).' },
  { moduleName: 'menu-items', entity: 'MenuItem', id: 'idMenu', title: 'Articles du Menu', icon: 'Coffee', desc: 'Gérez les plats et boissons du menu.' },
  { moduleName: 'item-types', entity: 'ItemType', id: 'idProductType', title: "Types d'Articles", icon: 'Layers', desc: 'Catégorisez les articles du stock.' },
  { moduleName: 'menu-categories', entity: 'MenuCategory', id: 'idCategory', title: 'Catégories de Menu', icon: 'List', desc: 'Gérez les catégories du menu (Entrées, Plats...).' }
];

entities.forEach(config => {
  const dir = path.join(basePath, config.moduleName);
  const componentName = `${config.entity}sModal`;
  const componentDir = path.join(dir, 'components', componentName);
  
  fs.mkdirSync(componentDir, { recursive: true });

  const code = `import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { ${config.icon}, Edit, Trash2, Plus, X, Check } from "lucide-react";
import type { ${config.entity} } from "../../types";

interface ${componentName}Props {
  isOpen: boolean;
  onClose: () => void;
  data: ${config.entity}[];
  onAdd: (data: Partial<${config.entity}>) => void;
  onEdit: (id: string, data: Partial<${config.entity}>) => void;
  onDelete: (id: string) => void;
}

// NOTE: Ceci est une version simplifiée (1 champ texte par défaut). 
// A adapter selon les champs réels de l'entité.
export function ${componentName}({ isOpen, onClose, data, onAdd, onEdit, onDelete }: ${componentName}Props) {
  const [newValue, setNewValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const handleAdd = () => {
    if (newValue.trim()) {
      onAdd({ label: newValue.trim() } as any); // Adapt based on actual DTO fields
      setNewValue("");
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.${config.id});
    // Guessing the main display field (label, title, name, etc.)
    setEditingValue(item.label || item.eventName || item.roomNumber || item.ref || "Édition");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const saveEdit = () => {
    if (editingValue.trim() && editingId) {
      onEdit(editingId, { label: editingValue.trim() } as any);
      setEditingId(null);
      setEditingValue("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl rounded-[2rem] p-0 overflow-hidden bg-card border shadow-2xl">
        <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-8 border-b">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary/20 text-primary rounded-xl">
                <${config.icon} className="size-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold tracking-tight text-secondary">
                  Gestion: ${config.title}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-1 text-sm">
                  ${config.desc}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-end gap-3 bg-muted/10 p-4 rounded-2xl border border-border/50">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Nouveau
              </label>
              <Input
                placeholder="Valeur principale..."
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="bg-background"
              />
            </div>
            <Button
              onClick={handleAdd}
              disabled={!newValue.trim()}
              className="gap-2 px-5 rounded-xl shrink-0"
            >
              <Plus className="size-4" />
              Ajouter
            </Button>
          </div>

          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {data.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
                Aucune donnée.
              </div>
            ) : (
              data.map((item: any) => (
                <div
                  key={item.${config.id}}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors group"
                >
                  {editingId === item.${config.id} ? (
                    <div className="flex-1 flex items-center gap-2 mr-4">
                      <Input
                        autoFocus
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="h-9 flex-1"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 font-semibold text-foreground text-sm">
                      {item.label || item.eventName || item.roomNumber || item.ref || item.${config.id}}
                    </div>
                  )}

                  <div className="flex items-center gap-1 shrink-0">
                    {editingId === item.${config.id} ? (
                      <>
                        <Button size="icon" variant="ghost" onClick={saveEdit} className="text-green-600">
                          <Check className="size-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={cancelEdit}>
                          <X className="size-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="icon" variant="ghost" onClick={() => startEdit(item)} className="opacity-0 group-hover:opacity-100">
                          <Edit className="size-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => onDelete(item.${config.id})} className="opacity-0 group-hover:opacity-100 text-destructive">
                          <Trash2 className="size-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="p-4 bg-muted/10 border-t">
          <Button onClick={onClose} variant="outline" className="w-full sm:w-auto rounded-xl">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
`;
  
  fs.writeFileSync(path.join(componentDir, `${componentName}.tsx`), code);
  
  // Re-export in index.ts
  fs.appendFileSync(path.join(dir, 'index.ts'), `export * from './components/${componentName}/${componentName}';\n`);

});
console.log("Modals generated");
