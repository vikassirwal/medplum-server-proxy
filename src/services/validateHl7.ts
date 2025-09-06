import { ValidationError } from '../dto/common.dto';

export const validateHL7Message = (message: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!message?.trim()) {
    errors.push({ field: 'message', message: 'Message cannot be empty' });
    return errors;
  }

  const segments = message.trim().split(/\r?\n/);

  if (segments.length === 0) {
    errors.push({ field: 'segments', message: 'No segments found' });
    return errors;
  }

  const firstSegment = segments[0];
  if (!firstSegment.startsWith('MSH')) {
    errors.push({ field: 'MSH', message: 'First segment must be MSH' });
  }

  validateMSHSegment(firstSegment, errors);

  segments.forEach((segment, index) => {
    validateSegmentFormat(segment, index, errors);
  });

  return errors;
};

const validateMSHSegment = (mshSegment: string, errors: ValidationError[]): void => {
  const fields = mshSegment.split('|');

  if (fields.length < 5) {
    errors.push({
      field: 'MSH',
      message: `MSH segment too short: ${fields.length} fields, expected at least 5`,
    });
    return;
  }

  if (fields[1] !== '^~\\&') {
    errors.push({
      field: 'MSH.1',
      message: `Invalid encoding characters: ${fields[1]}, expected ^~\\&`,
    });
  }

  if (fields.length > 8 && !fields[8]?.trim()) {
    errors.push({ field: 'MSH.9', message: 'Message type is required' });
  }
};

const validateSegmentFormat = (segment: string, index: number, errors: ValidationError[]): void => {
  if (segment.length < 3) {
    errors.push({
      field: `segment[${index}]`,
      message: `Segment too short: ${segment}`,
    });
    return;
  }

  const segmentId = segment.substring(0, 3);
  if (!/^[A-Z0-9]{3}$/.test(segmentId)) {
    errors.push({
      field: `segment[${index}]`,
      message: `Invalid segment ID: ${segmentId}`,
    });
  }

  if (segmentId !== 'MSH' && segment[3] !== '|') {
    errors.push({
      field: `segment[${index}]`,
      message: `Missing field separator after ${segmentId}`,
    });
  }
};