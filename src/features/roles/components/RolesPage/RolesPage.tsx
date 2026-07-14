import { useState, useEffect } from "react";
import { RolesList } from "../RolesList/RolesList";
import { RoleDetail } from "../RoleDetail/RoleDetail";
import type { MockRole as Role, PermissionCategory } from "../../types/index";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import type { SnackbarType } from "@/components/ui/Snackbar/snackbar";

// Mock Data
const MOCK_SCHEMA: PermissionCategory[] = [
  {
    category: "Utilisateurs & RH",
    permissions: [
      { id: "users_read", name: "Voir les employés", category: "Utilisateurs & RH" },
      { id: "users_create", name: "Créer un employé", category: "Utilisateurs & RH" },
      { id: "users_update", name: "Modifier un employé", category: "Utilisateurs & RH" },
      { id: "users_delete", name: "Supprimer un employé", category: "Utilisateurs & RH" },
    ]
  },
  {
    category: "Opérations de Vente",
    permissions: [
      { id: "sales_read", name: "Voir les ventes", category: "Opérations de Vente" },
      { id: "sales_create", name: "Enregistrer une vente", category: "Opérations de Vente" },
      { id: "sales_refund", name: "Effectuer un remboursement", category: "Opérations de Vente" },
    ]
  },
  {
    category: "Gestion des Stocks",
    permissions: [
      { id: "inventory_read", name: "Voir l'inventaire", category: "Gestion des Stocks" },
      { id: "inventory_update", name: "Mettre à jour le stock", category: "Gestion des Stocks" },
    ]
  }
];

const MOCK_ROLES: Role[] = [
  { id: "1", name: "Administrateur", permissions: ["users_read", "users_create", "users_update", "users_delete", "sales_read", "sales_create", "sales_refund", "inventory_read", "inventory_update"] },
  { id: "2", name: "Manager", permissions: ["users_read", "sales_read", "sales_create", "sales_refund", "inventory_read", "inventory_update"] },
  { id: "3", name: "Serveur", permissions: ["sales_create"] },
];

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbar, setSnackbar] = useState<{ message: string, type: SnackbarType, isOpen: boolean }>({ message: "", type: "info", isOpen: false });

  const showSnackbar = (message: string, type: SnackbarType = "info") => {
    setSnackbar({ message, type, isOpen: true });
  };

  // Simulated Fetch
  useEffect(() => {
    setRoles(MOCK_ROLES);
    // Auto-select first role on load if exists
    if (MOCK_ROLES.length > 0) {
      setSelectedRole(MOCK_ROLES[0]);
    }
  }, []);

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setSelectedRole(null);
    setIsCreating(true);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    if (roles.length > 0) {
      setSelectedRole(roles[0]);
    }
  };

  const handleSave = async (name: string, description: string, permissionIds: string[]) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (isCreating) {
          const newRole: Role = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            description,
            permissions: permissionIds
          };
          setRoles([...roles, newRole]);
          setSelectedRole(newRole);
          setIsCreating(false);
          showSnackbar("Rôle créé avec succès.", "success");
        } else if (selectedRole) {
          const updatedRoles = roles.map(r => r.id === selectedRole.id ? { ...r, name, description, permissions: permissionIds } : r);
          setRoles(updatedRoles);
          setSelectedRole({ ...selectedRole, name, description, permissions: permissionIds });
          showSnackbar("Rôle mis à jour avec succès.", "success");
        }
        resolve();
      }, 800);
    });
  };

  const handleDelete = async (roleId: string) => {
    const roleToDelete = roles.find(r => r.id === roleId);

    if (roleToDelete?.name === "Administrateur") {
      showSnackbar("Impossible de supprimer ce rôle. Ce rôle est actuellement attribué à 4 employés.", "error");
      return;
    }

    const confirm = window.confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${roleToDelete?.name}" ? Cette action est irréversible.`);
    if (confirm) {
      setRoles(roles.filter(r => r.id !== roleId));
      setSelectedRole(null);
      showSnackbar("Rôle supprimé avec succès.", "success");
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full gap-6">
      <RolesList
        roles={roles}
        selectedRoleId={selectedRole?.id || null}
        onSelectRole={handleSelectRole}
        onCreateNew={handleCreateNew}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="hidden md:block w-px bg-border/50" />

      <RoleDetail
        role={selectedRole}
        isCreating={isCreating}
        permissionsSchema={MOCK_SCHEMA}
        onSave={handleSave}
        onDelete={handleDelete}
        onCancel={handleCancelCreate}
      />

      {snackbar.isOpen && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar({ ...snackbar, isOpen: false })}
        />
      )}
    </div>
  );
}
