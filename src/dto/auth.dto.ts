
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
  success: boolean,
  message: string,
  timestamp: string,
  redirectUrl?: string
}

export interface AuthConfigDto {
  clientId: string;
  redirectUri: string;
}
