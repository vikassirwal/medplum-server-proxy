import { Request, Response } from 'express';
import { convertHl7ToFhir } from '../../src/controllers/conversionController';
import * as fhirService from '../../src/services/fhirService';
import * as validateHl7 from '../../src/services/validateHl7';

jest.mock('../../src/services/fhirService');
jest.mock('../../src/services/validateHl7');
jest.mock('../../src/constants/r4_resourceTypes', () => ({
  FHIR_R4_RESOURCE_TYPES: ['Patient', 'Coverage', 'ServiceRequest']
}));

const mockedFhirService = fhirService as jest.Mocked<typeof fhirService>;
const mockedValidateHl7 = validateHl7 as jest.Mocked<typeof validateHl7>;

describe('ConversionController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {
      body: {},
      headers: {}
    };
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    jest.clearAllMocks();
  });

  describe('convertHl7ToFhir', () => {
    const validHl7Message = 'MSH|^~\\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|20240101120000||ADT^A01|123456|P|2.5\r\nPID|1||123456||Doe^John||19900101|M|||123 Main St^^City^ST^12345||555-1234';

    it('should convert valid HL7 to FHIR', async () => {
      mockRequest.body = {
        message: validHl7Message,
        resourceType: 'Patient'
      };
      mockRequest.headers = { authorization: 'Bearer valid-token' };

      mockedValidateHl7.validateHL7Message.mockReturnValueOnce([]);
      mockedFhirService.checkFhirResourceExists.mockResolvedValueOnce({
        success: true,
        exists: false,
        data: { entry: [] }
      });
      mockedFhirService.postFhirResource.mockResolvedValueOnce({
        success: true,
        data: { resourceType: 'Patient', id: '123' },
        status: 201
      });

      await convertHl7ToFhir(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'FHIR insertion requested - see results below',
        conversionResults: expect.arrayContaining([
          expect.objectContaining({
            resourceType: 'Patient',
            success: true,
            status: 201
          })
        ]),
        timestamp: expect.any(String)
      });
    });

    it('should require authorization', async () => {
      mockRequest.body = {
        message: validHl7Message,
        resourceType: 'Patient'
      };
      mockRequest.headers = {};

      await convertHl7ToFhir(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Missing Authorization. Authorization is required in the request headers.',
        timestamp: expect.any(String)
      });
    });

    it('should validate HL7 message format', async () => {
      mockRequest.body = {
        message: 'Invalid HL7 message',
        resourceType: 'Patient'
      };
      mockRequest.headers = { authorization: 'Bearer valid-token' };

      mockedValidateHl7.validateHL7Message.mockReturnValueOnce([
        { field: 'MSH', message: 'First segment must be MSH' }
      ]);

      await convertHl7ToFhir(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to process HL7 v2 message.',
        error: [{ field: 'MSH', message: 'First segment must be MSH' }],
        timestamp: expect.any(String)
      });
    });

    it('should reject invalid resource types', async () => {
      mockRequest.body = {
        message: validHl7Message,
        resourceType: 'InvalidResource'
      };
      mockRequest.headers = { authorization: 'Bearer valid-token' };

      await convertHl7ToFhir(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid Resource Type. Resource Type is not a valid FHIR R4 resource type.',
        timestamp: expect.any(String)
      });
    });
  });
});