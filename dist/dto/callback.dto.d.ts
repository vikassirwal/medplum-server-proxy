export interface CallbackRequestDto {
    code?: string;
    state?: string;
    error?: string;
    error_description?: string;
    [key: string]: any;
}
export interface CallbackResponseDto {
    success: boolean;
    error: string;
    timestamp: string;
}
//# sourceMappingURL=callback.dto.d.ts.map