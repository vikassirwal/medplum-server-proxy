import axios from 'axios';
import { getFhirResource, postFhirResource, checkFhirResourceExists } from '../../src/services/fhirService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FhirService', () => {
  beforeEach(() => {
    process.env.OAUTH2_SERVER_URL = 'https://test.medplum.com';
    jest.clearAllMocks();
  });

  describe('getFhirResource', () => {
    it('should fetch FHIR resource by ID', async () => {
      const mockData = {
        resourceType: 'Patient',
        id: '123',
        name: [{ given: ['John'], family: 'Doe' }]
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockData,
        status: 200
      } as any);

      const result = await getFhirResource('Patient', '123', 'bearer-token');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://test.medplum.com/fhir/R4/Patient/123',
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer bearer-token',
            'Content-Type': 'application/fhir+json',
            'Accept': 'application/fhir+json',
          },
        })
      );
      expect(result).toEqual({
        success: true,
        data: mockData,
        status: 200
      });
    });

    it('should handle errors', async () => {
      const error = {
        response: {
          data: { resourceType: 'OperationOutcome', issue: [{ severity: 'error' }] },
          status: 404
        }
      };
      mockedAxios.get.mockRejectedValueOnce(error);

      const result = await getFhirResource('Patient', 'nonexistent', 'bearer-token');

      expect(result).toEqual({
        success: false,
        error: { resourceType: 'OperationOutcome', issue: [{ severity: 'error' }] },
        status: 404
      });
    });
  });

  describe('postFhirResource', () => {
    it('should create new FHIR resource', async () => {
      const resourceData = {
        resourceType: 'Patient',
        name: [{ given: ['John'], family: 'Doe' }]
      };

      const mockResponse = {
        resourceType: 'Patient',
        id: '123',
        name: [{ given: ['John'], family: 'Doe' }]
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 201
      } as any);

      const result = await postFhirResource('Patient', resourceData, 'bearer-token');

      expect(result).toEqual({
        success: true,
        data: mockResponse,
        status: 201
      });
    });
  });

  describe('checkFhirResourceExists', () => {
    it('should return true when resource exists', async () => {
      const mockBundleData = {
        resourceType: 'Bundle',
        type: 'searchset',
        entry: [{ resource: { id: '123' } }],
        total: 1
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockBundleData,
        status: 200
      } as any);

      const result = await checkFhirResourceExists('Patient', { identifier: '123' }, 'bearer-token');

      expect(result).toEqual({
        success: true,
        data: mockBundleData,
        status: 200,
        exists: true,
        total: 1
      });
    });
  });
});