import type { MockPermission } from "./permission";

export interface Role {
  idRole: string;
  label: string;
  description?: string;
}

export interface MockRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[]; // array of Permission IDs
}

export interface PermissionCategory {
  category: string;
  permissions: MockPermission[];
}
