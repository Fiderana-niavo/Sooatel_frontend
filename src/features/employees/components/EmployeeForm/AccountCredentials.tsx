import { Input } from "@/components/ui/Inputs/input";
import { MultiSelectCombobox } from "@/components/ui/Combobox/multi-select-combobox";
import type { Role } from "@/features/roles/types";

interface AccountCredentialsProps {
  username: string;
  onUsernameChange: (val: string) => void;
  password?: string;
  onPasswordChange?: (val: string) => void;
  selectedRoles: Role[];
  onRolesChange: (roles: Role[]) => void;
  availableRoles: Role[];
  isEditMode: boolean;
}

export function AccountCredentials({
  username,
  onUsernameChange,
  password,
  onPasswordChange,
  selectedRoles,
  onRolesChange,
  availableRoles,
  isEditMode,
}: AccountCredentialsProps) {

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20 animate-in fade-in slide-in-from-top-2 duration-300">
      <h3 className="text-lg font-semibold">Identifiants de connexion</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`space-y-2 ${isEditMode ? "md:col-span-2" : ""}`}>
          <label className="text-sm font-medium">Nom d'utilisateur <span className="text-destructive">*</span></label>
          <Input
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            placeholder="jdoe"
            required
            className="bg-background"
          />
        </div>

        {!isEditMode && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Mot de passe <span className="text-destructive">*</span></label>
            <Input
              type="password"
              value={password || ""}
              onChange={(e) => onPasswordChange?.(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-background"
            />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Rôles attribués</label>
        <MultiSelectCombobox<Role>
          options={availableRoles}
          selectedItems={selectedRoles}
          onChange={onRolesChange}
          getOptionLabel={(role) => role.label}
          getOptionValue={(role) => role.idRole}
          placeholder="Rechercher et ajouter des rôles..."
          emptyMessage="Aucun rôle trouvé."
        />
        <p className="text-xs text-muted-foreground">
          Sélectionnez un ou plusieurs rôles pour définir les permissions globales. Les permissions individuelles pourront être modifiées après la création.
        </p>
      </div>
    </div>
  );
}
