"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRestrictedFhirMethod = exports.getFhirResource = void 0;
const fhirService_1 = require("../services/fhirService");
const getFhirResource = async (req, res) => {
    try {
        const { resourceType, id } = req.params;
        const queryParams = req.query;
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const errorResponse = {
                success: false,
                error: 'Missing Authorization. Bearer token is required in Authorization header',
                timestamp: new Date().toISOString()
            };
            res.status(401).json(errorResponse);
            return;
        }
        const bearerToken = authHeader.split(' ')[1];
        const result = await (0, fhirService_1.getFhirResource)(resourceType, id, bearerToken, queryParams);
        if (result.success) {
            const successResponse = {
                success: true,
                data: result.data,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(successResponse);
        }
        else {
            const errorResponse = {
                success: false,
                error: result.error?.issue?.[0]?.diagnostics || result.error?.message || `Failed to retrieve FHIR resource: ${result.error}`,
                timestamp: new Date().toISOString()
            };
            res.status(result.status).json(errorResponse);
        }
    }
    catch (error) {
        let statusCode = 500;
        let errorMessage = `Failed to retrieve FHIR resource: ${error.message}`;
        if (error.response) {
            statusCode = error.response.status;
            errorMessage = error.response.data?.issue?.[0]?.diagnostics || error.response.data?.message || `FHIR API error: ${error.response.statusText}`;
        }
        const errorResponse = {
            success: false,
            error: `FHIR Request Failed: ${errorMessage}`,
            timestamp: new Date().toISOString()
        };
        res.status(statusCode).json(errorResponse);
    }
};
exports.getFhirResource = getFhirResource;
const handleRestrictedFhirMethod = (req, res) => {
    const method = req.method.toUpperCase();
    const errorResponse = {
        success: false,
        message: `${method} requests to FHIR resources are not supported. This endpoint only supports GET requests for read-only access to FHIR resources.`,
        timestamp: new Date().toISOString()
    };
    res.set('Allow', 'GET');
    res.status(405).json(errorResponse);
};
exports.handleRestrictedFhirMethod = handleRestrictedFhirMethod;
//# sourceMappingURL=fhirController.js.map