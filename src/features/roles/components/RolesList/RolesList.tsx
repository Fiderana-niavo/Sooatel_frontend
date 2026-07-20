import { Search, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import type { Role } from "../../types/index";

interface RolesListProps {
  roles: Role[];
  selectedRoleId: string | null;
  onSelectRole: (role: Role) => void;
  onCreateNew: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function RolesList({ 
  roles, 
  selectedRoleId, 
  onSelectRole, 
  onCreateNew,
  searchQuery,
  setSearchQuery
}: RolesListProps) {

  return (
    <div className="w-full md:w-80 flex flex-col border-r border-border/50 pr-4">
      <div className="mb-6 space-y-4">
        <Button 
          onClick={onCreateNew}
          className="w-full py-6 rounded-xl font-bold shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground group"
        >
          <Plus className="mr-2 size-5 group-hover:rotate-90 transition-transform" />
          Créer un rôle
        </Button>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search className="size-4" />
          </div>
          <Input 
            type="text" 
            placeholder="Rechercher un rôle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/30 border-border/50 rounded-lg focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="space-y-2 pr-2">
        {roles.map(role => {
          const isActive = role.idRole === selectedRoleId;
          return (
            <button
              key={role.idRole}
              onClick={() => onSelectRole(role)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group
                ${isActive 
                  ? "bg-white text-secondary font-bold shadow-sm border border-border/50" 
                  : "bg-transparent text-muted-foreground hover:bg-muted/30 border border-transparent hover:border-border/50"
                }
              `}
            >
              <span>{role.label}</span>
              <ChevronRight className={`size-4 transition-transform ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
            </button>
          );
        })}
        
        {roles.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Aucun rôle trouvé.
          </div>
        )}
      </div>
    </div>
  );
}
