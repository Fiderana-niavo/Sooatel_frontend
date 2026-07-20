import React from "react";
import type { Role, Permission } from "@/features/roles/types";
import { Badge } from "@/components/ui/Badge/badge";
import { Shield, Check, Ban, CheckCircle2, XCircle } from "lucide-react";

interface PermissionsGridProps {
  username: string;
  userRoles: Role[];
  allPermissions: Permission[];
  overrides: Record<string, "grant" | "deny" | "default">;
  onOverrideChange: (idPermission: string, override: "grant" | "deny" | "default") => void;
  rolePermissions: Record<string, string[]>;
}

export function PermissionsGrid({
  username,
  userRoles,
  allPermissions,
  overrides,
  onOverrideChange,
  rolePermissions,
}: PermissionsGridProps) {
  const hasPermissionFromRole = (idPermission: string) => {
    return userRoles.some(role => {
      const perms = rolePermissions[role.idRole] || [];
      return perms.includes(idPermission);
    });
  };

  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-muted/30 p-4 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg">Contrôle d'accès détaillé</h3>
          <p className="text-sm text-muted-foreground">
            Ajustez les permissions pour l'utilisateur <span className="font-medium text-foreground">{username}</span>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground mr-2">Rôles hérités:</span>
          {userRoles.map(r => (
            <Badge key={r.idRole} variant="secondary">{r.label}</Badge>
          ))}
          {userRoles.length === 0 && <span className="text-sm italic text-muted-foreground">Aucun rôle</span>}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-background">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-4 font-medium text-muted-foreground">Permission</th>
              <th className="p-4 font-medium w-32 text-center text-muted-foreground">Héritage</th>
              <th className="p-4 font-medium w-[300px] text-center text-muted-foreground">Remplacement (Override)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedPermissions).map(([category, perms]) => (
              <React.Fragment key={category}>
                <tr className="bg-muted/10 border-b">
                  <td colSpan={3} className="px-4 py-3 font-bold text-primary uppercase text-xs tracking-wider">
                    {category}
                  </td>
                </tr>
                {perms.map(perm => {
                  const isInherited = hasPermissionFromRole(perm.idPermission);
                  const currentOverride = overrides[perm.idPermission] || "default";
                  
                  let isEffective = isInherited;
                  if (currentOverride === "grant") isEffective = true;
                  if (currentOverride === "deny") isEffective = false;

                  return (
                     <tr key={perm.idPermission} className="border-b last:border-0 hover:bg-muted/5 transition-colors">
                      <td className="p-4">
                        <div className="font-medium flex items-center gap-2">
                          {perm.name}
                          {isEffective ? (
                            <span title="Actif" className="flex items-center"><CheckCircle2 className="size-4 text-green-500 fill-green-500/10 shrink-0" /></span>
                          ) : (
                            <span title="Inactif" className="flex items-center"><XCircle className="size-4 text-red-500 fill-red-500/10 shrink-0" /></span>
                          )}
                        </div>
                        {perm.description && <p className="text-xs text-muted-foreground mt-1">{perm.description}</p>}
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant={isInherited ? "default" : "outline"} className={isInherited ? "bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20" : "text-muted-foreground"}>
                          {isInherited ? "Autorisé" : "Bloqué"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex bg-muted/50 rounded-lg p-1 w-full max-w-[280px] mx-auto ring-1 ring-border/50">
                          <button
                            type="button"
                            onClick={() => onOverrideChange(perm.idPermission, "default")}
                            className={`flex-1 text-xs py-1.5 rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 ${currentOverride === "default" ? "bg-background shadow font-semibold text-foreground ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground"}`}
                          >
                            <Shield className="size-3.5 text-muted-foreground" />
                            <span>Défaut</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onOverrideChange(perm.idPermission, "grant")}
                            className={`flex-1 text-xs py-1.5 rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 ${currentOverride === "grant" ? "bg-green-500/10 text-green-700 shadow font-semibold ring-1 ring-green-500/20" : "text-muted-foreground hover:text-green-600 hover:bg-green-500/5"}`}
                          >
                            <Check className="size-3.5 text-green-500" />
                            <span>Forcer</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onOverrideChange(perm.idPermission, "deny")}
                            className={`flex-1 text-xs py-1.5 rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 ${currentOverride === "deny" ? "bg-red-500/10 text-red-700 shadow font-semibold ring-1 ring-red-500/20" : "text-muted-foreground hover:text-red-600 hover:bg-red-500/5"}`}
                          >
                            <Ban className="size-3.5 text-red-500" />
                            <span>Refuser</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
