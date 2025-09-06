import { ValidationError } from '../dto/common.dto';

export const validateHL7Message = (message: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Basic null/empty check
  if (!message?.trim()) {
    errors.push({ field: 'message', message: 'Message cannot be empty' });
    return errors;
  }

  // Split into segments
  const segments = message.trim().split(/\r?\n/);

  // Must have at least MSH segment
  if (segments.length === 0) {
    errors.push({ field: 'segments', message: 'No segments found' });
    return errors;
  }

  // Check if first segment is MSH
  const firstSegment = segments[0];
  if (!firstSegment.startsWith('MSH')) {
    errors.push({ field: 'MSH', message: 'First segment must be MSH' });
  }

  // Validate MSH segment structure
  validateMSHSegment(firstSegment, errors);

  // Check each segment has valid format
  segments.forEach((segment, index) => {
    validateSegmentFormat(segment, index, errors);
  });

  return errors;
};

const validateMSHSegment = (mshSegment: string, errors: ValidationError[]): void => {
  const fields = mshSegment.split('|');

  // MSH should have at least: MSH|^~\&|sending_app|sending_facility|...
  if (fields.length < 5) {
    errors.push({
      field: 'MSH',
      message: `MSH segment too short: ${fields.length} fields, expected at least 5`,
    });
    return;
  }

  // Check encoding characters (should be ^~\&)
  if (fields[1] !== '^~\\&') {
    errors.push({
      field: 'MSH.1',
      message: `Invalid encoding characters: ${fields[1]}, expected ^~\\&`,
    });
  }

  // Check message type exists (field 9, index 8)
  if (fields.length > 8 && !fields[8]?.trim()) {
    errors.push({ field: 'MSH.9', message: 'Message type is required' });
  }
};

const validateSegmentFormat = (segment: string, index: number, errors: ValidationError[]): void => {
  // Each segment should be at least 3 chars (segment ID)
  if (segment.length < 3) {
    errors.push({
      field: `segment[${index}]`,
      message: `Segment too short: ${segment}`,
    });
    return;
  }

  // Segment ID should be 3 uppercase letters/numbers
  const segmentId = segment.substring(0, 3);
  if (!/^[A-Z0-9]{3}$/.test(segmentId)) {
    errors.push({
      field: `segment[${index}]`,
      message: `Invalid segment ID: ${segmentId}`,
    });
  }

  // Should have field separator after segment ID (except MSH which is special)
  if (segmentId !== 'MSH' && segment[3] !== '|') {
    errors.push({
      field: `segment[${index}]`,
      message: `Missing field separator after ${segmentId}`,
    });
  }
};