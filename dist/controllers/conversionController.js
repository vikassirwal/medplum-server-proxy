"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertHl7ToFhir = void 0;
const convertHl7ToFhir = (req, res) => {
    const contentType = req.get('Content-Type');
    const bodySize = req.body ? JSON.stringify(req.body).length : 0;
    const response = {
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
exports.convertHl7ToFhir = convertHl7ToFhir;
//# sourceMappingURL=conversionController.js.map