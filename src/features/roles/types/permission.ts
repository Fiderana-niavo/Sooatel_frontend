export interface Permission {
  idPermission: string;
  permissionName: string;
  description?: string;
  category: string;
}

export interface MockPermission {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface PermissionItem {
  idPermission: string;
  permissionName: string;
}
