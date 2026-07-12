import type { PermissionItem } from "../../roles/types/permission";

export interface AuthUser {
  idUser: string;
  ref: string;
  username: string;
  idEmployee: string;
}

export interface LoginPayload {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  permissions: PermissionItem[];
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface PasswordResetRequestDto {
  username: string;
}

export interface ValidateResetKeyDto {
  key: string;
}

export interface ChangePasswordDto {
  key: string;
  newPassword: string;
}

export type PasswordResetResult =
  | { method: "email"; message: string; expiresAt: string }
  | { method: "manual"; token: string; expiresAt: string };
