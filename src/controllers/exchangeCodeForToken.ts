/**
 * OAuth Transaction Controller
 * Handles OAuth token exchange and transaction flows
 */

import { Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import { CallbackResponseDto } from '../dto/callback.dto';
import { ControllerFunction } from '../types/common.types';

// Get environment variables
const MEDPLUM_CLIENT_ID: string = process.env.MEDPLUM_CLIENT_ID || '';
const MEDPLUM_CLIENT_SECRET: string = process.env.MEDPLUM_CLIENT_SECRET || '';
const MEDPLUM_REDIRECT_URI: string = process.env.MEDPLUM_REDIRECT_URI || '';
const OAUTH2_SERVER_URL: string = process.env.OAUTH2_SERVER_URL || '';

/**
 * Exchanges authorization code for access token
 * @param code - Authorization code received from OAuth provider
 * @param state - Optional state parameter
 * @returns Promise with token response or error
 */
const exchangeCodeForToken = async (code: string, state?: string): Promise<any> => {
  try {
    // Create Basic Auth token (base64 encoded client_id:client_secret)
    const basicAuthToken = Buffer.from(`${MEDPLUM_CLIENT_ID}:${MEDPLUM_CLIENT_SECRET}`).toString('base64');
    
    // Prepare form data for token exchange
    const formData = new URLSearchParams();
    formData.append('grant_type', 'authorization_code');
    formData.append('client_id', MEDPLUM_CLIENT_ID);
    formData.append('code', code);
    formData.append('redirect_uri', MEDPLUM_REDIRECT_URI);
    
    // Make POST request to exchange code for token
    const response: AxiosResponse = await axios.post(
      `${OAUTH2_SERVER_URL}/oauth2/token`,
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${basicAuthToken}`
        }
      }
    );
    
    return {
      success: true,
      data: response.data,
      status: response.status
    };
    
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
};

/**
 * Handles OAuth callback requests from authorization servers via POST
 * @param req - Express request object
 * @param res - Express response object
 */
const getToken: ControllerFunction = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract authorization code from request body
    const { code, state, error } = req.body;
    
    if (error) {
      const errorResponse: CallbackResponseDto = {
        error: 'OAuth Authorization Failed',
        message: `OAuth error: ${error}`,
        endpoint: '/auth/oauth',
        method: 'POST',
        requestBody: req.body,
        timestamp: new Date().toISOString()
      };
      res.status(400).json(errorResponse);
      return;
    }
    
    if (!code) {
      const errorResponse: CallbackResponseDto = {
        error: 'Missing Authorization Code',
        message: 'Authorization code is required for OAuth flow',
        endpoint: '/auth/oauth',
        method: 'POST',
        requestBody: req.body,
        timestamp: new Date().toISOString()
      };
      res.status(400).json(errorResponse);
      return;
    }
    
    // Exchange authorization code for access token
    const tokenResult = await exchangeCodeForToken(code, state);
    
    if (!tokenResult.success) {
      const errorResponse: CallbackResponseDto = {
        error: 'Token Exchange Failed',
        message: `Failed to exchange authorization code for access token: ${JSON.stringify(tokenResult.error)}`,
        endpoint: '/auth/oauth',
        method: 'POST',
        requestBody: req.body,
        timestamp: new Date().toISOString()
      };
      res.status(tokenResult.status || 500).json(errorResponse);
      return;
    }
    
    // Success response with token data
    const successResponse = {
      success: true,
      message: 'OAuth authorization completed successfully',
      endpoint: '/auth/oauth',
      method: 'POST',
      authorizationCode: code,
      state: state || null,
      tokenData: tokenResult.data,
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json(successResponse);
    
  } catch (error: any) {
    const errorResponse: CallbackResponseDto = {
      error: 'OAuth Processing Failed',
      message: `Failed to process OAuth callback: ${error.message}`,
      endpoint: '/auth/oauth',
      method: 'POST',
      requestBody: req.body,
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(errorResponse);
  }
};

export {
  getToken,
  exchangeCodeForToken
};