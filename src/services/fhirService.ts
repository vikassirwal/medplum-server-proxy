/**
 * FHIR Service
 * Reusable service for FHIR API operations
 */

import axios, { AxiosResponse } from 'axios';

// Get environment variables
const OAUTH2_SERVER_URL: string = process.env.OAUTH2_SERVER_URL || '';

/**
 * Makes a GET request to retrieve FHIR resources
 * @param resourceType - FHIR resource type (e.g., 'Patient', 'Coverage')
 * @param resourceId - Optional resource ID for specific resource retrieval
 * @param bearerToken - Bearer token for authentication
 * @param queryParams - Optional query parameters for filtering/searching
 * @returns Promise with API response or error
 */
export const getFhirResource = async (resourceType: string, resourceId: string | null, bearerToken: string, queryParams?: Record<string, any>): Promise<any> => {
  try {
    let fhirUrl = resourceId 
      ? `${OAUTH2_SERVER_URL}/fhir/R4/${resourceType}/${resourceId}`
      : `${OAUTH2_SERVER_URL}/fhir/R4/${resourceType}`;
    
    // Add query parameters if provided
    if (queryParams && Object.keys(queryParams).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      fhirUrl += `?${searchParams.toString()}`;
    }
    
    const response: AxiosResponse = await axios.get(fhirUrl, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      }
    });
    
    return {
      success: true,
      data: response.data,
      status: response.status,
      resourceType: resourceType,
      resourceId: resourceId
    };
    
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
      resourceType: resourceType,
      resourceId: resourceId
    };
  }
};

/**
 * Makes a POST request to create FHIR resources
 * @param resourceType - FHIR resource type (e.g., 'Patient', 'Coverage')
 * @param resourceData - FHIR resource data object
 * @param bearerToken - Bearer token for authentication
 * @returns Promise with API response or error
 */
export const postFhirResource = async (resourceType: string, resourceData: any, bearerToken: string): Promise<any> => {
  try {
    const fhirUrl = `${OAUTH2_SERVER_URL}/fhir/R4/${resourceType}`;
    
    const response: AxiosResponse = await axios.post(fhirUrl, resourceData, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      }
    });
    
    return {
      success: true,
      data: response.data,
      status: response.status,
      resourceType: resourceType
    };
    
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
      resourceType: resourceType
    };
  }
};

/**
 * Checks if a FHIR resource exists by searching for it
 * @param resourceType - FHIR resource type
 * @param searchParams - Search parameters (e.g., identifier, name, etc.)
 * @param bearerToken - Bearer token for authentication
 * @returns Promise with search results or error
 */
export const checkFhirResourceExists = async (resourceType: string, searchParams: Record<string, string>, bearerToken: string): Promise<any> => {
  try {
    const searchUrl = `${OAUTH2_SERVER_URL}/fhir/R4/${resourceType}`;
    const queryParams = new URLSearchParams(searchParams).toString();
    const fhirUrl = queryParams ? `${searchUrl}?${queryParams}` : searchUrl;
    
    const response: AxiosResponse = await axios.get(fhirUrl, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      }
    });
    
    return {
      success: true,
      data: response.data,
      status: response.status,
      resourceType: resourceType,
      exists: response.data?.total > 0,
      total: response.data?.total || 0
    };
    
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
      resourceType: resourceType,
      exists: false,
      total: 0
    };
  }
};
