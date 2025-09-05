import { Request, Response } from 'express';
export interface ApiResponse<T = any> {
    error?: string;
    message: string;
    data?: T;
    timestamp: string;
}
export interface ErrorResponse extends ApiResponse {
    error: string;
    statusCode: number;
}
export interface SuccessResponse<T = any> extends ApiResponse<T> {
    data: T;
}
export type ControllerFunction = (req: Request, res: Response) => void | Promise<void>;
export interface EnvironmentConfig {
    PORT: number;
    MEDPLUM_CLIENT_ID: string;
    MEDPLUM_REDIRECT_URI: string;
}
//# sourceMappingURL=common.types.d.ts.map