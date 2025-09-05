"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authController_1 = require("./controllers/authController");
const fhirController_1 = require("./controllers/fhirController");
const callbackController_1 = require("./controllers/callbackController");
const conversionController_1 = require("./controllers/conversionController");
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3010', 10);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/auth/authorize', authController_1.initiateAuthorization);
app.get('/fhir/:resourceType/:id?', fhirController_1.getFhirResource);
app.get('/callback', callbackController_1.handleCallback);
app.post('/convert/hl7-to-fhir', conversionController_1.convertHl7ToFhir);
app.listen(PORT, () => {
    console.log(`🚀 Medplum Proxy Server is running on port ${PORT}`);
    console.log(`📍 Visit: http://localhost:${PORT}`);
});
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=server.js.map