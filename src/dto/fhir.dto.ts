
export interface FhirResourceRequestDto {
  resourceType: string;
  id?: string;
}

export interface FhirResourceResponseDto {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
  message?: string;
}

export interface FhirResourceDto {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
  };
  [key: string]: any;
}
