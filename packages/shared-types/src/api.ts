/**
 * API-related types
 */

export interface ApiResponse<T = unknown> {
  data?: T;
  message: string;
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface HealthCheckResponse {
  status: "ok" | "degraded" | "error";
  version: string;
  uptime: number;
  timestamp: string;
}
