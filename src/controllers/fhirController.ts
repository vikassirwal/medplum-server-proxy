import { Request, Response } from 'express';
import { FhirResourceResponseDto } from '../dto/fhir.dto';
import { ControllerFunction } from '../types/common.types';
import { getFhirResource as fhirServiceGet } from '../services/fhirService';


const getFhirResource: ControllerFunction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resourceType, id } = req.params;
    const queryParams = req.query;

    // Extract Bearer token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const errorResponse: FhirResourceResponseDto = {
        success: false,
        error: 'Missing Authorization. Bearer token is required in Authorization header',
        timestamp: new Date().toISOString(),
      };
      res.status(401).json(errorResponse);
      return;
    }

    const bearerToken = authHeader.split(' ')[1];

    // Use the FHIR service to get the resource with query parameters
    const result = await fhirServiceGet(resourceType, id, bearerToken, queryParams);

    if (result.success) {
      const successResponse: FhirResourceResponseDto= {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(successResponse);
    } else {
      const errorResponse: FhirResourceResponseDto = {
        success: false,
        error: 'Failed to retrieve FHIR resource',
        message: result.error,
        timestamp: new Date().toISOString(),
      };

      res.status(result.status).json(errorResponse);
    }

  } catch (error: any) {
    let statusCode = 500;
    
    const errorResponse: FhirResourceResponseDto = {
      success: false,
      error: `FHIR Request Failed`,
      message: error.message,
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(errorResponse);
  }
};


const handleRestrictedFhirMethod: ControllerFunction = (req: Request, res: Response): void => {
  const method = req.method.toUpperCase();

  const errorResponse: FhirResourceResponseDto = {
    success: false,
    message: `${method} requests to FHIR resources are not supported. This endpoint only supports GET requests for read-only access to FHIR resources.`,
    timestamp: new Date().toISOString(),
  };

  // Set Allow header to indicate supported methods
  res.set('Allow', 'GET');
  res.status(405).json(errorResponse);
};

export {
  getFhirResource,
  handleRestrictedFhirMethod,
};
