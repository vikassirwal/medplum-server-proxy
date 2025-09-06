import { Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import { AuthorizeResponseDto } from '../dto/auth.dto';
import { ControllerFunction } from '../types/common.types';

const MEDPLUM_CLIENT_ID: string = process.env.MEDPLUM_CLIENT_ID || '';
const MEDPLUM_REDIRECT_URI: string = process.env.MEDPLUM_REDIRECT_URI || '';
const OAUTH2_SERVER_URL: string = process.env.OAUTH2_SERVER_URL || '';

const initiateAuthorization: ControllerFunction = async (req: Request, res: Response): Promise<void> => {
  try {
    // Build the OAuth2 authorization URL with query parameters
    const authorizationUrl = new URL(`${OAUTH2_SERVER_URL}/oauth2/authorize`);
    authorizationUrl.searchParams.append('response_type', 'code');
    authorizationUrl.searchParams.append('client_id', MEDPLUM_CLIENT_ID);
    authorizationUrl.searchParams.append('redirect_uri', MEDPLUM_REDIRECT_URI);
    authorizationUrl.searchParams.append('scope', 'openid');

    const axiosResponse: AxiosResponse = await axios.get(authorizationUrl.toString(), {
      validateStatus: (status: number) => status < 500,
    });

    // Extract redirect URL from Location header
    const redirectUrl = axiosResponse.request.res?.responseUrl || null;
    const responseData: AuthorizeResponseDto = {
      success: true,
      message: axiosResponse.statusText,
      redirectUrl,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(responseData);

  } catch (error: any) {
    const errorResponse: AuthorizeResponseDto = {
      success: false,
      message: `Failed to connect to OAuth2 server: ${error.message}`,
      timestamp: new Date().toISOString(),
    };

    res.status(502).json(errorResponse);
  }
};

export {
  initiateAuthorization,
};
