import { Request, Response } from 'express';
import { getFhirResource, handleRestrictedFhirMethod } from '../../src/controllers/fhirController';
import * as fhirService from '../../src/services/fhirService';

jest.mock('../../src/services/fhirService');
const mockedFhirService = fhirService as jest.Mocked<typeof fhirService>;

describe('FhirController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSet: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockSet = jest.fn();
    
    mockRequest = {
      params: {},
      query: {},
      headers: {},
      method: 'GET'
    };
    mockResponse = {
      status: mockStatus,
      json: mockJson,
      set: mockSet,
    };

    jest.clearAllMocks();
  });

  describe('getFhirResource', () => {
    it('should return FHIR resource when authorized', async () => {
      mockRequest.params = { resourceType: 'Patient', id: '123' };
      mockRequest.headers = { authorization: 'Bearer valid-token' };
      
      const mockData = {
        resourceType: 'Patient',
        id: '123',
        name: [{ given: ['John'], family: 'Doe' }]
      };

      mockedFhirService.getFhirResource.mockResolvedValueOnce({
        success: true,
        data: mockData,
        status: 200
      });

      await getFhirResource(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockData,
        timestamp: expect.any(String)
      });
    });

    it('should reject requests without authorization', async () => {
      mockRequest.params = { resourceType: 'Patient' };
      mockRequest.headers = {};

      await getFhirResource(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Missing Authorization. Bearer token is required in Authorization header',
        timestamp: expect.any(String)
      });
    });

    it('should handle FHIR service errors', async () => {
      mockRequest.params = { resourceType: 'Patient', id: '123' };
      mockRequest.headers = { authorization: 'Bearer valid-token' };

      mockedFhirService.getFhirResource.mockResolvedValueOnce({
        success: false,
        error: 'Resource not found',
        status: 404
      });

      await getFhirResource(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to retrieve FHIR resource',
        message: 'Resource not found',
        timestamp: expect.any(String)
      });
    });
  });

  describe('handleRestrictedFhirMethod', () => {
    it('should block POST requests', () => {
      mockRequest.method = 'POST';

      handleRestrictedFhirMethod(mockRequest as Request, mockResponse as Response);

      expect(mockSet).toHaveBeenCalledWith('Allow', 'GET');
      expect(mockStatus).toHaveBeenCalledWith(405);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'POST requests to FHIR resources are not supported. This endpoint only supports GET requests for read-only access to FHIR resources.',
        timestamp: expect.any(String)
      });
    });
  });
});