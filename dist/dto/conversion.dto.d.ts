export interface Hl7ToFhirRequestDto {
    hl7Message: string;
    messageType?: string;
    version?: string;
}
export interface Hl7ToFhirResponseDto {
    error?: string;
    message: string;
    endpoint: string;
    method: string;
    contentType?: string;
    bodySize: number;
    hl7MessageReceived?: boolean;
    conversionResults?: Array<{
        resourceType: string;
        success: boolean;
        data?: any;
        error?: any;
        status: number;
        existed?: boolean;
        totalFound?: number;
    }>;
    timestamp: string;
    fhirBundle?: any;
}
export interface Hl7MessageDto {
    messageHeader: {
        messageType: string;
        version: string;
        timestamp: string;
    };
    segments: Hl7SegmentDto[];
}
export interface Hl7SegmentDto {
    segmentType: string;
    fields: string[];
}
//# sourceMappingURL=conversion.dto.d.ts.map