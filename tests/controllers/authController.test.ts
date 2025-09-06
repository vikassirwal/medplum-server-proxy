import { Request, Response } from 'express';
import axios from 'axios';
import { initiateAuthorization } from '../../src/controllers/authController';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {};
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    process.env.MEDPLUM_CLIENT_ID = 'test-client-id';
    process.env.MEDPLUM_REDIRECT_URI = 'http://localhost:3000/callback';
    process.env.OAUTH2_SERVER_URL = 'https://test.medplum.com';

    jest.clearAllMocks();
  });

  describe('initiateAuthorization', () => {
    it('should return authorization URL on success', async () => {
      const mockAxiosResponse = {
        status: 200,
        statusText: 'OK',
        request: {
          res: {
            responseUrl: 'https://test.medplum.com/oauth2/authorize?response_type=code&client_id=test-client-id'
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockAxiosResponse as any);

      await initiateAuthorization(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'OK',
        redirectUrl: 'https://test.medplum.com/oauth2/authorize?response_type=code&client_id=test-client-id',
        timestamp: expect.any(String)
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValueOnce(error);

      await initiateAuthorization(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(502);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to connect to OAuth2 server: Network error',
        timestamp: expect.any(String)
      });
    });
  });
});