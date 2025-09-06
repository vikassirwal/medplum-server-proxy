import { Request, Response } from 'express';
import { Hl7ToFhirResponseDto } from '../dto/conversion.dto';
import { ControllerFunction } from '../types/common.types';
import { FHIR_R4_RESOURCE_TYPES } from '../constants/r4_resourceTypes';
import { HL7ToPatientConverter } from '../mapper/patient';
import { HL7ToCoverageConverter } from '../mapper/coverage';
import { HL7ToServiceRequestConverter } from '../mapper/serviceRequest';
import { postFhirResource, checkFhirResourceExists } from '../services/fhirService';
import { validateHL7Message } from '../services/validateHl7';


const loadHl7ToFhir = async (hl7Message: string, resourceTypeList: string[], conversionResults: any[], bearerToken: string): Promise<any> => {
  try {
    for (const resourceType of resourceTypeList) {
      let resource: any = null;

      // Convert HL7 to FHIR based on resource type
      if(resourceType === 'Patient') {
        resource = HL7ToPatientConverter(hl7Message);
      } else if(resourceType === 'Coverage') {
        resource = HL7ToCoverageConverter(hl7Message);
      } else if(resourceType === 'ServiceRequest') {
        resource = HL7ToServiceRequestConverter(hl7Message);
      }

      if (resource) {
        // Check if resource already exists
        let existsCheck = null;

        if (resource.id) {
          const searchParams = {
            identifier: resource.id,
          };
          existsCheck = await checkFhirResourceExists(resourceType, searchParams, bearerToken);
        }

        if(existsCheck?.exists) {
          conversionResults.push({
            resourceType,
            success: true,
            data: 'Resource already exists, this resource is not created or updated',
            status: 409, // Conflict
          });
        } else {
          // Post the resource to Medplum API
          const postResult = await postFhirResource(resourceType, resource, bearerToken);
          conversionResults.push({
            resourceType,
            success: postResult.success,
            data: postResult.data,
            error: postResult.error,
            status: postResult.status,
          });
        }
      }
    }
  } catch (error: any) {
    console.error('Error processing HL7 message:', error.message);
    throw error;
  }
};


const convertHl7ToFhir: ControllerFunction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, resourceType } = req.body;
    const { authorization } = req.headers;
    const bearerToken = authorization ? authorization.split(' ')[1] : null;

    if(!bearerToken) {
      res.status(401).json({
        success: false,
        error: 'Missing Authorization. Authorization is required in the request headers.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if(!message || !resourceType) {
      const errorResponse: Hl7ToFhirResponseDto = {
        success: false,
        error: 'Missing Message or Resource Type. Message and Resource Type are required in the request body.',
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(errorResponse);
      return;
    }

    const resourceTypeList = resourceType.split(',');

    // validate resource type
    for(const resourceType of resourceTypeList) {
      if(!FHIR_R4_RESOURCE_TYPES.includes(resourceType)) {
        const errorResponse: Hl7ToFhirResponseDto = {
          success: false,
          error: 'Invalid Resource Type. Resource Type is not a valid FHIR R4 resource type.',
          timestamp: new Date().toISOString(),
        };

        res.status(500).json(errorResponse);
        return;
      }
    }

    // validate hl7 message
    const hl7Message: string = typeof message === 'string' ? message : JSON.stringify(message);
    const errors = validateHL7Message(hl7Message);

    if(errors.length > 0) {
      res.status(400).json({ 
        success: false,
        message: 'Failed to process HL7 v2 message.',
        error: errors,
        timestamp: new Date().toISOString(), 
    });
    return;
    }

    const conversionResults: any[] = [];

    await loadHl7ToFhir(hl7Message, resourceTypeList, conversionResults, bearerToken);

    // Success response with conversion results
    const response: Hl7ToFhirResponseDto = {
      success: true,
      message: 'FHIR insertion requested - see results below',
      conversionResults: conversionResults,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);

  } catch (error: any) {
    console.error('Error processing HL7 message:', error.message);

    const errorResponse: Hl7ToFhirResponseDto = {
      success: false,
      error: `Failed to process HL7 v2 message: ${error.message}`,
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(errorResponse);
  }
};

export {
  convertHl7ToFhir,
};
