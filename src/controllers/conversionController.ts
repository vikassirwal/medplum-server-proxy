/**
 * Conversion Controller
 * Handles message format conversion endpoints
 */

import { Request, Response } from 'express';
import { Hl7ToFhirResponseDto } from '../dto/conversion.dto';
import { ControllerFunction } from '../types/common.types';

/**
 * Converts HL7 v2 messages to FHIR format
 * @param req - Express request object
 * @param res - Express response object
 */
const convertHl7ToFhir: ControllerFunction = (req: Request, res: Response): void => {
  const contentType = req.get('Content-Type');
  const bodySize = req.body ? JSON.stringify(req.body).length : 0;

  const response: Hl7ToFhirResponseDto = {
    error: 'Not Implemented',
    message: 'HL7 v2 to FHIR conversion endpoint is not yet implemented',
    endpoint: '/convert/hl7-to-fhir',
    method: 'POST',
    contentType,
    bodySize,
    timestamp: new Date().toISOString()
  };

  res.status(501).json(response);
};

export {
  convertHl7ToFhir
};
