/**
 * FHIR Controller
 * Handles FHIR resource-related endpoints
 */

import { Request, Response } from 'express';
import { FhirResourceResponseDto } from '../dto/fhir.dto';
import { ControllerFunction } from '../types/common.types';
import { getFhirResource as fhirServiceGet } from '../services/fhirService';

/**
 * Retrieves FHIR resources by type and optional ID using Bearer token authentication
 * @param req - Express request object
 * @param res - Express response object
 */
const getFhirResource: ControllerFunction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resourceType } = req.params;
    const { id } = req.params;
    const queryParams = req.query;
    
    // Extract Bearer token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const errorResponse: FhirResourceResponseDto = {
        error: 'Missing Authorization',
        message: 'Bearer token is required in Authorization header',
        timestamp: new Date().toISOString()
      };
      res.status(401).json(errorResponse);
      return;
    }
    
    const bearerToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Use the FHIR service to get the resource with query parameters
    const result = await fhirServiceGet(resourceType, id || null, bearerToken, queryParams);
    
    if (result.success) {
      // Return successful response with FHIR data
      const successResponse = {
        success: true,
        message: 'FHIR resource retrieved successfully',
        data: result.data,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(successResponse);
    } else {
      // Handle error from FHIR service
      const errorResponse: FhirResourceResponseDto = {
        error: 'FHIR Request Failed',
        message: result.error?.issue?.[0]?.diagnostics || result.error?.message || `Failed to retrieve FHIR resource: ${result.error}`,
        timestamp: new Date().toISOString()
      };
      
      res.status(result.status).json(errorResponse);
    }
    
  } catch (error: any) {
    // Handle different types of errors
    let statusCode = 500;
    let errorMessage = `Failed to retrieve FHIR resource: ${error.message}`;
    
    if (error.response) {
      statusCode = error.response.status;
      errorMessage = error.response.data?.issue?.[0]?.diagnostics || 
                    error.response.data?.message || 
                    `FHIR API error: ${error.response.statusText}`;
    }
    
    const errorResponse: FhirResourceResponseDto = {
      error: 'FHIR Request Failed',
      message: errorMessage,
      timestamp: new Date().toISOString()
    };
    
    res.status(statusCode).json(errorResponse);
  }
};

/**
 * Handles restricted HTTP methods for FHIR endpoints
 * @param req - Express request object
 * @param res - Express response object
 */
const handleRestrictedFhirMethod: ControllerFunction = (req: Request, res: Response): void => {
  const { resourceType } = req.params;
  const method = req.method.toUpperCase();
  
  const errorResponse: FhirResourceResponseDto = {
    error: 'Method Not Allowed',
    message: `${method} requests to FHIR resources are not supported. This endpoint only supports GET requests for read-only access to FHIR resources.`,
    timestamp: new Date().toISOString()
  };
  
  // Set Allow header to indicate supported methods
  res.set('Allow', 'GET');
  res.status(405).json(errorResponse);
};

export {
  getFhirResource,
  handleRestrictedFhirMethod
};
