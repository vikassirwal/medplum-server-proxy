"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateAuthorization = void 0;
const axios_1 = __importDefault(require("axios"));
const MEDPLUM_CLIENT_ID = process.env.MEDPLUM_CLIENT_ID || '';
const MEDPLUM_REDIRECT_URI = process.env.MEDPLUM_REDIRECT_URI || '';
const OAUTH2_SERVER_URL = process.env.OAUTH2_SERVER_URL || '';
const initiateAuthorization = async (req, res) => {
    try {
        const authorizationUrl = new URL(`${OAUTH2_SERVER_URL}/oauth2/authorize`);
        authorizationUrl.searchParams.append('response_type', 'code');
        authorizationUrl.searchParams.append('client_id', MEDPLUM_CLIENT_ID);
        authorizationUrl.searchParams.append('redirect_uri', MEDPLUM_REDIRECT_URI);
        authorizationUrl.searchParams.append('scope', 'openid');
        const axiosResponse = await axios_1.default.get(authorizationUrl.toString(), {
            validateStatus: (status) => status < 500,
        });
        const redirectUrl = axiosResponse.request.res?.responseUrl || null;
        const responseData = {
            success: true,
            message: axiosResponse.statusText,
            redirectUrl,
            timestamp: new Date().toISOString()
        };
        res.status(200).json(responseData);
    }
    catch (error) {
        const errorResponse = {
            success: false,
            message: `Failed to connect to OAuth2 server: ${error.message}`,
            timestamp: new Date().toISOString()
        };
        res.status(502).json(errorResponse);
    }
};
exports.initiateAuthorization = initiateAuthorization;
//# sourceMappingURL=authController.js.map