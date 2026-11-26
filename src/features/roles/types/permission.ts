export interface Permission {
  idPermission: string;
  name: string;
  code: string;
  description?: string;
  category: string;
}

export interface PermissionItem {
  idPermission: string;
  name: string;
  code: string;
  description?: string;
  categoryLabel?: string;
}
