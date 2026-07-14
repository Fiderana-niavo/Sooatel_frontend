export interface ApiResponse<T> {
  ok: boolean;
  payload: T;
  message: string;
  error: string;
}
