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
            maxRedirects: 0,
        });
        console.log('axiosResponse', axiosResponse.headers);
        const redirectUrl = axiosResponse.headers.location || null;
        console.log('Captured redirect URL:', redirectUrl);
        console.log('redirectUrl', redirectUrl);
        const responseData = {
            status: axiosResponse.status,
            statusText: axiosResponse.statusText,
            redirectUrl,
        };
        console.log('OAuth2 Response:', responseData);
        res.status(200).json(responseData);
    }
    catch (error) {
        console.error('❌ OAuth2 authorization request failed:', error.message);
        const errorResponse = {
            error: 'OAuth2 Request Failed',
            message: `Failed to connect to OAuth2 server: ${error.message}`,
            endpoint: '/auth/authorize',
            method: 'GET',
            config: {
                clientId: MEDPLUM_CLIENT_ID,
                redirectUri: MEDPLUM_REDIRECT_URI
            },
            timestamp: new Date().toISOString()
        };
        const errorWithDetails = {
            ...errorResponse,
            errorDetails: {
                code: error.code,
                requestUrl: `${OAUTH2_SERVER_URL}/oauth2/authorize`
            }
        };
        res.status(502).json(errorWithDetails);
    }
};
exports.initiateAuthorization = initiateAuthorization;
//# sourceMappingURL=authController.js.map