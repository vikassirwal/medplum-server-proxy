import axios, { AxiosResponse } from 'axios';

const OAUTH2_SERVER_URL: string = process.env.OAUTH2_SERVER_URL || '';

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

    // Make the GET request
    const response: AxiosResponse = await axios.get(fhirUrl, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json',
      },
    });

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


export const postFhirResource = async (resourceType: string, resourceData: any, bearerToken: string): Promise<any> => {
  try {
    const fhirUrl = `${OAUTH2_SERVER_URL}/fhir/R4/${resourceType}`;

    const response: AxiosResponse = await axios.post(fhirUrl, resourceData, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json',
      },
    });

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


export const checkFhirResourceExists = async (resourceType: string, searchParams: Record<string, string>, bearerToken: string): Promise<any> => {
  try {
    const searchUrl = `${OAUTH2_SERVER_URL}/fhir/R4/${resourceType}`;
    const queryParams = new URLSearchParams(searchParams).toString();
    const fhirUrl = queryParams ? `${searchUrl}?${queryParams}` : searchUrl;

    const response: AxiosResponse = await axios.get(fhirUrl, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json',
      },
    });

    return {
      success: true,
      data: response.data,
      status: response.status,
      exists: response.data?.entry?.length > 0,
      total: response.data?.total || 0,
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
      exists: false,
      total: 0,
    };
  }
};
