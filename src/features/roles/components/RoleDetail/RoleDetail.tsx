import React, { useState, useEffect } from "react";
import { Trash2, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import type { MockRole as Role, PermissionCategory } from "../../types/index";

interface RoleDetailProps {
  role: Role | null;
  isCreating: boolean;
  permissionsSchema: PermissionCategory[];
  onSave: (name: string, description: string, permissionIds: string[]) => Promise<void>;
  onDelete: (roleId: string) => void;
  onCancel?: () => void;
}

export function RoleDetail({ 
  role, 
  isCreating, 
  permissionsSchema, 
  onSave, 
  onDelete,
  onCancel
}: RoleDetailProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Sync state when role changes
  useEffect(() => {
    if (isCreating) {
      setName("");
      setDescription("");
      setSelectedPermissions(new Set());
    } else if (role) {
      setName(role.name);
      setDescription(role.description || "");
      setSelectedPermissions(new Set(role.permissions));
    }
  }, [role, isCreating]);

  const handleTogglePermission = (id: string) => {
    const next = new Set(selectedPermissions);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPermissions(next);
  };

  const handleToggleCategory = (category: PermissionCategory) => {
    const categoryIds = category.permissions.map(p => p.id);
    const allSelected = categoryIds.every(id => selectedPermissions.has(id));
    
    const next = new Set(selectedPermissions);
    if (allSelected) {
      categoryIds.forEach(id => next.delete(id));
    } else {
      categoryIds.forEach(id => next.add(id));
    }
    setSelectedPermissions(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsLoading(true);
    try {
      await onSave(name, description, Array.from(selectedPermissions));
    } finally {
      setIsLoading(false);
    }
  };

  if (!role && !isCreating) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/10 rounded-[2rem] border border-border/30 h-full">
        Sélectionnez un rôle pour voir ses détails ou créez-en un nouveau.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pl-0 md:pl-6 animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          {isCreating ? (
            <span className="text-primary">Créer un nouveau rôle</span>
          ) : (
            <>
              <span className="text-secondary">Modifier le rôle</span>
            </>
          )}
        </h2>
        <div className="flex justify-between items-end">
          <p className="text-muted-foreground text-sm">
            Définissez le nom du rôle et les autorisations associées.
          </p>
          <span className="text-xs text-muted-foreground"><span className="text-destructive font-bold">*</span> Champ obligatoire</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        <div className="space-y-4 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground ml-1">Nom du rôle <span className="text-destructive">*</span></label>
            <Input 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Manager"
              className="bg-muted/20 border-border/50 text-secondary focus-visible:ring-primary/50 py-6 text-lg rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground ml-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez brièvement les responsabilités de ce rôle..."
              className="flex w-full bg-muted/20 border-border/50 text-secondary focus-visible:ring-primary/50 rounded-xl border px-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-y custom-scrollbar"
            />
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <label className="text-sm font-bold text-primary ml-1">Matrice des permissions</label>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {selectedPermissions.size} sélectionnée(s)
          </span>
        </div>

        <div className="max-h-[350px] overflow-y-auto border border-border/50 rounded-2xl bg-muted/10 p-6 mb-8 custom-scrollbar">
          <div className="space-y-6">
            {permissionsSchema.map(category => {
              const categoryIds = category.permissions.map(p => p.id);
              const allSelected = categoryIds.every(id => selectedPermissions.has(id));
              const someSelected = categoryIds.some(id => selectedPermissions.has(id));
              
              return (
                <div key={category.category} className="bg-white border border-border/40 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-border/30 pb-3">
                    <h3 className="font-bold text-primary text-base">{category.category}</h3>
                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-secondary transition-colors">Tout sélectionner</span>
                      <input 
                        type="checkbox"
                        checked={allSelected}
                        ref={input => {
                          if (input) input.indeterminate = someSelected && !allSelected;
                        }}
                        onChange={() => handleToggleCategory(category)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
                      />
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {category.permissions.map(permission => (
                      <label 
                        key={permission.id}
                        className={`flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer
                          ${selectedPermissions.has(permission.id) 
                            ? "border-primary/40 bg-primary/5 shadow-sm" 
                            : "border-border/30 hover:border-primary/30 hover:bg-muted/30"
                          }
                        `}
                      >
                        <input 
                          type="checkbox"
                          checked={selectedPermissions.has(permission.id)}
                          onChange={() => handleTogglePermission(permission.id)}
                          className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
                        />
                        <div className="flex flex-col">
                          <span className={`text-sm font-semibold text-muted-foreground`}>
                            {permission.name}
                          </span>
                          {permission.description && (
                            <span className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {permission.description}
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
          <div className="flex gap-2">
            {!isCreating && role && (
              <Button 
                type="button" 
                variant="destructive"
                onClick={() => onDelete(role.id)}
                className="rounded-xl px-6 font-semibold"
              >
                <Trash2 className="size-4 mr-2" />
                Supprimer
              </Button>
            )}
          </div>

          <div className="flex gap-4">
            {isCreating && onCancel && (
              <Button 
                type="button"
                variant="outline"
                onClick={onCancel}
                className="rounded-xl px-8 py-6 text-base font-semibold border-border/50"
              >
                Annuler
              </Button>
            )}
            <Button 
              type="submit"
              disabled={isLoading || !name.trim()}
              className="rounded-xl px-8 py-6 text-base font-bold shadow-lg shadow-primary/20"
            >
              <Save className="size-5 mr-2" />
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
