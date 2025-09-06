"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertHl7ToFhir = void 0;
const r4_resourceTypes_1 = require("../constants/r4_resourceTypes");
const patient_1 = require("../mapper/patient");
const coverage_1 = require("../mapper/coverage");
const serviceRequest_1 = require("../mapper/serviceRequest");
const fhirService_1 = require("../services/fhirService");
const validateHl7_1 = require("../services/validateHl7");
const loadHl7ToFhir = async (hl7Message, resourceTypeList, bearerToken) => {
    const conversionResults = [];
    for (const resourceType of resourceTypeList) {
        let resource = null;
        if (resourceType === 'Patient') {
            resource = (0, patient_1.HL7ToPatientConverter)(hl7Message);
        }
        else if (resourceType === 'Coverage') {
            resource = (0, coverage_1.HL7ToCoverageConverter)(hl7Message);
        }
        else if (resourceType === 'ServiceRequest') {
            resource = (0, serviceRequest_1.HL7ToServiceRequestConverter)(hl7Message);
        }
        if (resource) {
            let existsCheck = null;
            if (resource.id) {
                const searchParams = {
                    identifier: resource.id
                };
                existsCheck = await (0, fhirService_1.checkFhirResourceExists)(resourceType, searchParams, bearerToken);
            }
            if (existsCheck.success) {
                conversionResults.push({
                    resourceType,
                    success: true,
                    data: 'Resource already exists, this resource is not created or updated',
                    status: 200,
                    totalFound: existsCheck?.total || 0
                });
            }
            else {
                const postResult = await (0, fhirService_1.postFhirResource)(resourceType, resource, bearerToken);
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
};
const convertHl7ToFhir = async (req, res) => {
    try {
        const { message, resourceType } = req.body;
        const { authorization } = req.headers;
        const bearerToken = authorization ? authorization.split(' ')[1] : null;
        if (!bearerToken) {
            res.status(401).json({
                success: false,
                error: 'Missing Authorization.Authorization is required in the request headers.',
                timestamp: new Date().toISOString()
            });
            return;
        }
        if (!message || !resourceType) {
            const errorResponse = {
                success: false,
                error: 'Missing Message or Resource Type. Message and Resource Type are required in the request body.',
                timestamp: new Date().toISOString()
            };
            res.status(400).json(errorResponse);
            return;
        }
        const resourceTypeList = resourceType.split(',');
        for (const resourceType of resourceTypeList) {
            if (!r4_resourceTypes_1.FHIR_R4_RESOURCE_TYPES.includes(resourceType)) {
                const errorResponse = {
                    success: false,
                    error: 'Invalid Resource Type. Resource Type is not a valid FHIR R4 resource type.',
                    timestamp: new Date().toISOString()
                };
                res.status(500).json(errorResponse);
                return;
            }
        }
        let hl7Message = typeof message === 'string' ? message : JSON.stringify(message);
        const errors = (0, validateHl7_1.validateHL7Message)(hl7Message);
        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }
        const conversionResults = [];
        const response = {
            message: 'HL7 v2 message converted and posted to FHIR API successfully.',
            endpoint: '/convert/hl7-to-fhir',
            method: 'POST',
            bodySize: hl7Message.length,
            hl7MessageReceived: true,
            conversionResults: conversionResults,
            timestamp: new Date().toISOString()
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error processing HL7 message:', error.message);
        const errorResponse = {
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
exports.convertHl7ToFhir = convertHl7ToFhir;
//# sourceMappingURL=conversionController.js.map