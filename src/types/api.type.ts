export interface ApiResponse<T> {
  ok: boolean;
  payload: T;
  message: string;
  error: string;
}

export interface PaginatedResponse<T> {
  records: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SelectOptionDto {
  value: string | number;
  label: string;
}
