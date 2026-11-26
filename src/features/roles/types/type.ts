import type { PermissionItem } from "./permission";

export interface Role {
  idRole: string;
  label: string;
  description?: string;
  permissions?: PermissionItem[];
}

export interface PermissionCategory {
  category: string;
  permissions: PermissionItem[];
}
