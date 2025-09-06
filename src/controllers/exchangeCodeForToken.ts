import { Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import { CallbackResponseDto } from '../dto/callback.dto';
import { ControllerFunction } from '../types/common.types';

const MEDPLUM_CLIENT_ID: string = process.env.MEDPLUM_CLIENT_ID || '';
const MEDPLUM_CLIENT_SECRET: string = process.env.MEDPLUM_CLIENT_SECRET || '';
const MEDPLUM_REDIRECT_URI: string = process.env.MEDPLUM_REDIRECT_URI || '';
const OAUTH2_SERVER_URL: string = process.env.OAUTH2_SERVER_URL || '';



const exchangeCodeForToken = async (code: string): Promise<any> => {
  try {
    const basicAuthToken = Buffer.from(`${MEDPLUM_CLIENT_ID}:${MEDPLUM_CLIENT_SECRET}`).toString('base64');

    // Prepare form data for token exchange
    const formData = new URLSearchParams();
    formData.append('grant_type', 'authorization_code');
    formData.append('client_id', MEDPLUM_CLIENT_ID);
    formData.append('code', code);
    formData.append('redirect_uri', MEDPLUM_REDIRECT_URI);

    // POST request to exchange code for token
    const response: AxiosResponse = await axios.post(
      `${OAUTH2_SERVER_URL}/oauth2/token`,
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${basicAuthToken}`,
        },
      },
    );

    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
};

const getToken: ControllerFunction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;

    if (!code) {
      const errorResponse: CallbackResponseDto = {
        success: false,
        error: 'Missing Authorization Code',
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(errorResponse);
      return;
    }

    // Exchange authorization code for access token
    const tokenResult = await exchangeCodeForToken(code);

    if (!tokenResult.success) {
      const errorResponse: CallbackResponseDto = {
        success: false,
        error: `Failed to exchange authorization code for access token: ${JSON.stringify(tokenResult.error)}`,
        timestamp: new Date().toISOString(),
      };
      res.status(tokenResult.status || 500).json(errorResponse);
      return;
    }

    const successResponse = {
      success: true,
      message: 'OAuth authorization completed successfully',
      authorizationCode: code,
      tokenData: tokenResult.data,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(successResponse);

  } catch (error: any) {
    const errorResponse: CallbackResponseDto = {
      success: false,
      error: `Failed to process OAuth callback: ${error.message}`,
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(errorResponse);
  }
};

export {
  getToken,
  exchangeCodeForToken,
};
