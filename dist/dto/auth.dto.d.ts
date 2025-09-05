export interface AuthorizeRequestDto {
    response_type?: string;
    client_id?: string;
    redirect_uri?: string;
    scope?: string;
    state?: string;
    code_challenge?: string;
    code_challenge_method?: string;
}
export interface AuthorizeResponseDto {
    error?: string;
    message: string;
    endpoint: string;
    method: string;
    config?: {
        clientId: string;
        redirectUri: string;
    };
    timestamp: string;
}
export interface AuthConfigDto {
    clientId: string;
    redirectUri: string;
}
//# sourceMappingURL=auth.dto.d.ts.map