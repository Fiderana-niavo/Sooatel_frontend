import axios from "axios";
import type {
  ChangePasswordDto,
  LoginDto,
  LoginPayload,
  PasswordResetRequestDto,
  PasswordResetResult,
  ValidateResetKeyDto,
} from "../types/auth.type";
import type { ApiResponse } from "@/types/api.type";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const AuthService = {
  login: async (dto: LoginDto): Promise<LoginPayload> => {
    const res = await axios.post<ApiResponse<LoginPayload>>(`${BASE}/auth/login`, dto);
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  refresh: async (token: string): Promise<{ accessToken: string }> => {
    const res = await axios.post<ApiResponse<{ accessToken: string }>>(`${BASE}/auth/refresh`, {
      token,
    });
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  requestPasswordReset: async (dto: PasswordResetRequestDto): Promise<PasswordResetResult> => {
    const res = await axios.post<ApiResponse<PasswordResetResult>>(
      `${BASE}/auth/password/request-reset`,
      dto,
    );
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  validateResetKey: async (dto: ValidateResetKeyDto): Promise<{ valid: boolean }> => {
    const res = await axios.post<ApiResponse<{ valid: boolean }>>(
      `${BASE}/auth/password/validate-key`,
      dto,
    );
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },

  changePassword: async (dto: ChangePasswordDto): Promise<{ success: boolean }> => {
    const res = await axios.post<ApiResponse<{ success: boolean }>>(
      `${BASE}/auth/password/reset`,
      dto,
    );
    if (!res.data.ok) throw new Error(res.data.error);
    return res.data.payload;
  },
};
