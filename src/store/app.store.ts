import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/features/auth/types/auth.type";
import type { PermissionItem } from "@/features/roles/types/permission";

interface AppStore {
  connectedUser: AuthUser | null;
  permissions: PermissionItem[];
  setConnectedUser: (user: AuthUser) => void;
  setPermissions: (permissions: PermissionItem[]) => void;
  hasPermission: (code: string) => boolean;
  clear: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      connectedUser: null,
      permissions: [],

      setConnectedUser: (user) => set({ connectedUser: user }),

      setPermissions: (permissions) => set({ permissions }),

      hasPermission: (code) =>
        get().permissions.some((p) => p.code === code),

      clear: () => set({ connectedUser: null, permissions: [] }),
    }),
    {
      name: "app-store",
      version: 2, // Invalide le cache précédent (qui utilisait permissionName au lieu de code)
      partialize: (state) => ({
        connectedUser: state.connectedUser,
        permissions: state.permissions,
      }),
    },
  ),
);
