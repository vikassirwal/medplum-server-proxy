/**
 * Conversion Controller
 * Handles message format conversion endpoints
 */

import { Request, Response } from 'express';
import { Hl7ToFhirResponseDto } from '../dto/conversion.dto';
import { ControllerFunction } from '../types/common.types';
import { FHIR_R4_RESOURCE_TYPES } from '../constants/r4_resourceTypes';
import { HL7ToPatientConverter } from '../mapper/patient';
import { HL7ToCoverageConverter } from '../mapper/coverage';
import { HL7ToServiceRequestConverter } from '../mapper/serviceRequest';
import { postFhirResource, checkFhirResourceExists } from '../services/fhirService';
import { validateHL7Message } from '../services/validateHl7';


/**
 * Converts HL7 v2 messages to FHIR format
 * @param req - Express request object
 * @param res - Express response object
 */
const convertHl7ToFhir: ControllerFunction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, resourceType } = req.body;
    const { authorization } = req.headers;
    const bearerToken = authorization ? authorization.split(' ')[1] : null;
    
    if(!bearerToken) {
      res.status(401).json({
          error: 'Missing Authorization',
          message: 'Authorization is required in the request headers.',
          timestamp: new Date().toISOString()
        });
      return;
    }

    if(!message || !resourceType) {
      const errorResponse: Hl7ToFhirResponseDto = {
        error: 'Missing Message or Resource Type',
        message: 'Message and Resource Type are required in the request body.',
        endpoint: '/convert/hl7-to-fhir',
        method: 'POST',
        bodySize: 0,
        timestamp: new Date().toISOString()
      };
      res.status(400).json(errorResponse);
      return;
    }

    const resourceTypeList = resourceType.split(',');

    for(const resourceType of resourceTypeList) {
      if(!FHIR_R4_RESOURCE_TYPES.includes(resourceType)) {
        const errorResponse: Hl7ToFhirResponseDto = {
          error: 'Invalid Resource Type',
          message: 'Resource Type is not a valid FHIR R4 resource type.',
          endpoint: '/convert/hl7-to-fhir',
          method: 'POST',
          bodySize: 0,
          timestamp: new Date().toISOString()
        };

        res.status(500).json(errorResponse);
        return;
      }
    }
    
    let hl7Message: string = typeof message === 'string' ? message : JSON.stringify(message);

    const errors = validateHL7Message(hl7Message);
    if(errors.length > 0) {
      res.status(400).json({errors});
      return;
    }
    
    const conversionResults = [];
    
    for (const resourceType of resourceTypeList) {
      let resource: any = null;
      
      // Convert HL7 to FHIR based on resource type
      if(resourceType === 'Patient') {
        resource = HL7ToPatientConverter(hl7Message);
      } else if(resourceType === 'Coverage') {
        resource = HL7ToCoverageConverter(hl7Message, '123');
      } else if(resourceType === 'ServiceRequest') {
        resource = HL7ToServiceRequestConverter(hl7Message, '123');
      }
      
      if (resource) {
        // Check if resource already exists (using identifier if available)
        let existsCheck = null;
        if (resource.id) {
          const searchParams = {
            identifier: resource.id 
          };
          existsCheck = await checkFhirResourceExists(resourceType, searchParams, bearerToken);
        }

        if(existsCheck.success) { 
          conversionResults.push({
            resourceType,
            success: true,
            data: 'Resource already exists, this resource is not created or updated',
            status: 200,
            totalFound: existsCheck?.total || 0
          });
        } else {
            // Post the resource to Medplum API (create or update)
            const postResult = await postFhirResource(resourceType, resource, bearerToken);
            conversionResults.push({
              resourceType,
              success: postResult.success,
              data: postResult.data,
              error: postResult.error,
              status: postResult.status,
              totalFound: existsCheck?.total || 0
            });
        }
      }
    }

    // Success response with conversion results
    const response: Hl7ToFhirResponseDto = {
      message: 'HL7 v2 message converted and posted to FHIR API successfully.',
      endpoint: '/convert/hl7-to-fhir',
      method: 'POST',
      bodySize: hl7Message.length,
      hl7MessageReceived: true,
      conversionResults: conversionResults,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
    
  } catch (error: any) {
    console.error('Error processing HL7 message:', error.message);
    
    const errorResponse: Hl7ToFhirResponseDto = {
      error: 'Processing Failed',
      message: `Failed to process HL7 v2 message: ${error.message}`,
      endpoint: '/convert/hl7-to-fhir',
      method: 'POST',
      bodySize: 0,
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(errorResponse);
  }
};

export {
  convertHl7ToFhir
};
