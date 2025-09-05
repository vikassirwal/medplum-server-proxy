"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFhirResource = void 0;
const getFhirResource = (req, res) => {
    const { resourceType, id } = req.params;
    const response = {
        error: 'Not Implemented',
        message: 'FHIR resource retrieval endpoint is not yet implemented',
        endpoint: `/fhir/${resourceType}${id ? `/${id}` : ''}`,
        method: 'GET',
        resourceType: resourceType || '',
        resourceId: id || 'all',
        timestamp: new Date().toISOString()
    };
    res.status(501).json(response);
};
exports.getFhirResource = getFhirResource;
//# sourceMappingURL=fhirController.js.map