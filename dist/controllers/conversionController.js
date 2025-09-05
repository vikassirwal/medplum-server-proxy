"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertHl7ToFhir = void 0;
const r4_resourceTypes_1 = require("../constants/r4_resourceTypes");
const patient_1 = require("../mapper/patient");
const coverage_1 = require("../mapper/coverage");
const serviceRequest_1 = require("../mapper/serviceRequest");
const fhirService_1 = require("../services/fhirService");
const convertHl7ToFhir = async (req, res) => {
    try {
        const { message, resourceType } = req.body;
        const { authorization } = req.headers;
        const bearerToken = authorization ? authorization.split(' ')[1] : null;
        console.log('bearerToken-->', bearerToken);
        if (!bearerToken) {
            res.status(401).json({
                error: 'Missing Authorization',
                message: 'Authorization is required in the request headers.',
                timestamp: new Date().toISOString()
            });
            return;
        }
        if (!message || !resourceType) {
            const errorResponse = {
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
        for (const resourceType of resourceTypeList) {
            if (!r4_resourceTypes_1.FHIR_R4_RESOURCE_TYPES.includes(resourceType)) {
                const errorResponse = {
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
        let hl7Message = typeof message === 'string' ? message : JSON.stringify(message);
        console.log('resourceTypeList-->', resourceTypeList);
        const conversionResults = [];
        for (const resourceType of resourceTypeList) {
            let resource = null;
            if (resourceType === 'Patient') {
                resource = (0, patient_1.HL7ToPatientConverter)(hl7Message);
            }
            else if (resourceType === 'Coverage') {
                resource = (0, coverage_1.HL7ToCoverageConverter)(hl7Message, '123');
            }
            else if (resourceType === 'ServiceRequest') {
                resource = (0, serviceRequest_1.HL7ToServiceRequestConverter)(hl7Message, '123');
            }
            if (resource) {
                console.log(`${resourceType} resource-->`, JSON.stringify(resource));
                let existsCheck = null;
                if (resource.id && resource.id.length > 0) {
                    const searchParams = {
                        id: resource.id
                    };
                    existsCheck = await (0, fhirService_1.checkFhirResourceExists)(resourceType, searchParams, bearerToken);
                    console.log(`${resourceType} exists check-->`, existsCheck);
                }
                const postResult = await (0, fhirService_1.postFhirResource)(resourceType, resource, bearerToken);
                conversionResults.push({
                    resourceType,
                    success: postResult.success,
                    data: postResult.data,
                    error: postResult.error,
                    status: postResult.status,
                    existed: existsCheck?.exists || false,
                    totalFound: existsCheck?.total || 0
                });
                console.log(`${resourceType} API response-->`, postResult);
            }
        }
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