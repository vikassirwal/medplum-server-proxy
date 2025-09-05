/**
 * Data Transfer Objects for Conversion endpoints
 */

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
