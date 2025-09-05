export interface CallbackRequestDto {
    code?: string;
    state?: string;
    error?: string;
    error_description?: string;
    [key: string]: any;
}
export interface CallbackResponseDto {
    error?: string;
    message: string;
    endpoint: string;
    method: string;
    queryParams?: Record<string, any>;
    requestBody?: Record<string, any>;
    timestamp: string;
}
//# sourceMappingURL=callback.dto.d.ts.map