export interface FhirResourceRequestDto {
    resourceType: string;
    id?: string;
}
export interface FhirResourceResponseDto {
    error?: string;
    message: string;
    endpoint?: string;
    method?: string;
    resourceType?: string;
    resourceId?: string;
    timestamp: string;
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
//# sourceMappingURL=fhir.dto.d.ts.map