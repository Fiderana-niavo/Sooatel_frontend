export interface Permission {
  idPermission: string;
  permissionName: string;
  description?: string;
  category: string;
}

export interface PermissionItem {
  idPermission: string;
  permissionName: string;
  description?: string;
  categoryLabel?: string;
}
