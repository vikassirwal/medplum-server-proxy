import { Request, Response } from 'express';
import { getToken, exchangeCodeForToken } from '../../src/controllers/exchangeCodeForToken';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ExchangeCodeForToken', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {
      body: {}
    };
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    process.env.MEDPLUM_CLIENT_ID = 'test-client-id';
    process.env.MEDPLUM_CLIENT_SECRET = 'test-client-secret';
    process.env.MEDPLUM_REDIRECT_URI = 'http://localhost:3000/callback';
    process.env.OAUTH2_SERVER_URL = 'https://test.medplum.com';

    jest.clearAllMocks();
  });

  describe('getToken', () => {
    it('should exchange code for token successfully', async () => {
      mockRequest.body = { code: 'auth-code-123' };

      const mockTokenResponse = {
        access_token: 'access-token-123',
        token_type: 'Bearer',
        expires_in: 3600
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockTokenResponse,
        status: 200
      } as any);

      await getToken(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'OAuth authorization completed successfully',
        authorizationCode: 'auth-code-123',
        tokenData: mockTokenResponse,
        timestamp: expect.any(String)
      });
    });

    it('should require authorization code', async () => {
      mockRequest.body = {};

      await getToken(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Missing Authorization Code',
        timestamp: expect.any(String)
      });
    });

    it('should handle token exchange failure', async () => {
      mockRequest.body = { code: 'invalid-code' };

      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: { error: 'invalid_grant' },
          status: 400
        }
      });

      await getToken(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to exchange authorization code for access token: {"error":"invalid_grant"}',
        timestamp: expect.any(String)
      });
    });
  });
});