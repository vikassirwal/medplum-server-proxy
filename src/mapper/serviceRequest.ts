import { ServiceRequestResourceDto } from '../dto/resource.dto';

const extractId = (field: string): string | undefined => {
    return field?.split('^')[0];
  }

  const createPatientIdentifier = (field: string): { value: string }[] | undefined => {
    return [{value: field?.split('^')[0]}];
  }

  const extractStatus = (field: string): 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed' | 'entered-in-error' | 'unknown' => {
    const statusMap: { [key: string]: any } = {
      'A': 'active',        // Some type of action is being taken
      'CA': 'revoked',      // Cancel order request
      'CM': 'completed',    // Order is completed
      'DC': 'revoked',      // Discontinued
      'ER': 'entered-in-error', // Error
      'HD': 'on-hold',      // Hold order request
      'IP': 'active',       // In process
      'SC': 'active'        // In process scheduled
    };
    
    return statusMap[field] || 'active';
  }

  const extractCategory = (): { coding: { code: string; display: string }[] }[] => {
    return [{
      coding: [{
        code: '3457005',
        display: 'Patient referral'
      }]
    }];
  }

  const extractCode = (field: string): { coding: { code: string; display: string }[] } | undefined => {
    if (!field) return undefined;
    
    const codeComponents = field.split('^');
    return {
      coding: [{
        code: codeComponents[0] || '',
        display: codeComponents[1] || codeComponents[0] || 'Unknown Service'
      }]
    };
  }

  const extractRequester = (field: string): { reference: string } | undefined => {
    if (!field) return undefined;
    
    const providerComponents = field.split('^');
    const providerId = providerComponents[0];
    
    return providerId ? { reference: `Practitioner/${providerId}` } : undefined;
  }

  const extractDate = (field: string): string | undefined => {
    if (!field || field.length < 8) return undefined;
    
    // Convert YYYYMMDD[HHMMSS] to YYYY-MM-DD
    const year = field.substring(0, 4);
    const month = field.substring(4, 6);
    const day = field.substring(6, 8);
    
    return `${year}-${month}-${day}`;
  }

  const extractPriority = (field: string): 'routine' | 'urgent' | 'asap' | 'stat' | undefined => {
    const priorityMap: { [key: string]: any } = {
      'S': 'stat',
      'A': 'asap', 
      'R': 'routine',
      'P': 'routine',
      'C': 'routine',
      'T': 'routine'
    };
    
    return priorityMap[field] || 'routine';
  }

export const HL7ToServiceRequestConverter = (hl7Message: string, patientId: string): ServiceRequestResourceDto => {
    const lines = hl7Message.split('\n');
    const obrLine = lines.find(line => line.startsWith('OBR')) || 
                    lines.find(line => line.startsWith('ORC'));

    if (!obrLine) {
    throw new Error('OBR or ORC segment not found');
    }

    const fields = obrLine.split('|');

    const serviceRequest: ServiceRequestResourceDto = {
    resourceType: 'ServiceRequest',
    id: extractId(fields[2] || fields[3]),
    identifier: createPatientIdentifier(fields[2] || fields[3]),
    status: extractStatus(fields[5]),
    intent: 'order',
    category: extractCategory(),
    code: extractCode(fields[4]),
    subject: { reference: `Patient/${patientId}` },
    requester: extractRequester(fields[16]),
    priority: extractPriority(fields[5])
    };

    return serviceRequest;
  }