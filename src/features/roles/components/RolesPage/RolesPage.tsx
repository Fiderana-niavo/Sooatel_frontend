import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { RolesList } from "../RolesList/RolesList";
import { RoleDetail } from "../RoleDetail/RoleDetail";
import type { Role, PermissionCategory } from "../../types/index";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import type { SnackbarType } from "@/components/ui/Snackbar/snackbar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { RoleService } from "../../services/role.service";
import { PermissionService } from "../../services/permission.service";

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionsSchema, setPermissionsSchema] = useState<PermissionCategory[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const action = searchParams.get("action");
  const roleId = searchParams.get("id");
  const isCreating = action === "create";
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbar, setSnackbar] = useState<{ message: string, type: SnackbarType, isOpen: boolean }>({ message: "", type: "info", isOpen: false });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const showSnackbar = (message: string, type: SnackbarType = "info") => {
    setSnackbar({ message, type, isOpen: true });
  };

  const isInitialized = useRef(false);

  const loadData = useCallback(async () => {
    try {
      const [rolesData, permsData] = await Promise.all([
        RoleService.getAll({ limit: 100, search: searchQuery }), // Assuming we want all roles here
        PermissionService.getAllGrouped()
      ]);
      setRoles(rolesData.records);
      setPermissionsSchema(permsData);
      
      if (!isInitialized.current) {
        if (rolesData.first && !roleId && action !== "create") {
          setSearchParams({ id: rolesData.first.idRole });
        } else if (rolesData.records.length > 0 && !roleId && action !== "create") {
          setSearchParams({ id: rolesData.records[0].idRole });
        }
        isInitialized.current = true;
      }
      
    } catch (err: unknown) {
      console.error(err);
      showSnackbar("Erreur lors du chargement des données.", "error");
    }
  }, [searchQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(timeout);
  }, [loadData]);

  useEffect(() => {
    if (roleId) {
      RoleService.getOne(roleId).then(fullRole => {
        setSelectedRole(fullRole);
      }).catch(err => {
        console.error(err);
        showSnackbar("Erreur lors de la récupération des détails du rôle.", "error");
      });
    } else if (action === "create") {
      setSelectedRole(null);
    }
  }, [roleId, action]);

  const handleSelectRole = async (role: Role) => {
    setSearchParams({ id: role.idRole });
  };

  const handleCreateNew = () => {
    setSearchParams({ action: "create" });
  };

  const handleCancelCreate = () => {
    if (roles.length > 0) {
      setSearchParams({ id: roles[0].idRole });
    } else {
      setSearchParams({});
    }
  };

  const handleSave = async (label: string, description: string, permissionIds: string[]) => {
    try {
      if (isCreating) {
        const newRole = await RoleService.create({ label, description, permissionIds });
        showSnackbar("Rôle créé avec succès.", "success");
        await loadData();
        handleSelectRole(newRole);
      } else if (selectedRole) {
        await RoleService.update(selectedRole.idRole, { label, description, permissionIds });
        showSnackbar("Rôle mis à jour avec succès.", "success");
        await loadData();
        handleSelectRole({ ...selectedRole, label, description, permissions: [] }); // Permissions fetched in handleSelectRole
      }
    } catch (err: unknown) {
      console.error(err);
      showSnackbar(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.", "error");
    }
  };

  const promptDelete = (roleId: string) => {
    const roleToDelete = roles.find(r => r.idRole === roleId);
    if (!roleToDelete) return;

    if (roleToDelete.label.toLowerCase() === "administrateur") {
      showSnackbar("Impossible de supprimer le rôle administrateur.", "error");
      return;
    }

    setRoleToDelete(roleToDelete);
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!roleToDelete) return;
    try {
      await RoleService.delete(roleToDelete.idRole);
      setRoles(roles.filter(r => r.idRole !== roleToDelete.idRole));
      setSelectedRole(null);
      showSnackbar("Rôle supprimé avec succès.", "success");
      if (roles.length > 1) {
        handleSelectRole(roles.find(r => r.idRole !== roleToDelete.idRole)!);
      }
    } catch (err: unknown) {
      console.error(err);
      showSnackbar(err instanceof Error ? err.message : "Erreur lors de la suppression.", "error");
    } finally {
      setConfirmOpen(false);
      setRoleToDelete(null);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full gap-6">
      <RolesList
        roles={roles}
        selectedRoleId={selectedRole?.idRole || null}
        onSelectRole={handleSelectRole}
        onCreateNew={handleCreateNew}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="hidden md:block w-px bg-border/50" />

      <RoleDetail
        role={selectedRole}
        isCreating={isCreating}
        permissionsSchema={permissionsSchema}
        onSave={handleSave}
        onDelete={promptDelete}
        onCancel={handleCancelCreate}
      />

      {snackbar.isOpen && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar({ ...snackbar, isOpen: false })}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirmation de suppression"
        description={`Êtes-vous sûr de vouloir supprimer le rôle "${roleToDelete?.label}" ? Cette action est irréversible.`}
        onConfirm={executeDelete}
      />
    </div>
  );
}
