import { ServiceRequestResourceDto } from '../dto/resource.dto';

const extractId = (field: string): string | undefined => {
  return field?.split('^')[0];
};

const createPatientIdentifier = (field: string): { value: string }[] | undefined => {
  return [{ value: field?.split('^')[0] }];
};

const extractStatus = (field: string): 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed' | 'entered-in-error' | 'unknown' => {
  const statusMap: { [key: string]: any } = {
    'A': 'active',       
    'CA': 'revoked',     
    'CM': 'completed',    
    'DC': 'revoked',     
    'ER': 'entered-in-error', 
    'HD': 'on-hold',     
    'IP': 'active',      
    'SC': 'active',      
  };

  return statusMap[field] || 'active';
};

const extractCategory = (): { coding: { code: string; display: string }[] }[] => {
  return [{
    coding: [{
      code: '3457005',
      display: 'Patient referral',
    }],
  }];
};

const extractCode = (field: string): { coding: { code: string; display: string }[] } | undefined => {
  if (!field) return undefined;

  const codeComponents = field.split('^');
  return {
    coding: [{
      code: codeComponents[0] || '',
      display: codeComponents[1] || codeComponents[0] || 'Unknown Service',
    }],
  };
};

const extractRequester = (field: string): { reference: string } | undefined => {
  if (!field) return undefined;

  const providerComponents = field.split('^');
  const providerId = providerComponents[0];

  return providerId ? { reference: `Practitioner/${providerId}` } : undefined;
};

const extractPatientId = (hl7Message: string): string => {
  const lines = hl7Message.split('\n');
  const pidLine = lines.find(line => line.startsWith('PID'));

  if (!pidLine) {
    throw new Error('PID segment not found - cannot extract patient ID');
  }

  const fields = pidLine.split('|');
  const patientId = fields[3]?.split('^')[0];

  if (!patientId) {
    throw new Error('Patient ID not found in PID segment');
  }

  return patientId;
};

export const HL7ToServiceRequestConverter = (hl7Message: string): ServiceRequestResourceDto => {
  const lines = hl7Message.split('\n');
  const obrLine = lines.find(line => line.startsWith('OBR')) || lines.find(line => line.startsWith('ORC'));

  // Extract patient ID from the HL7 message
  const patientId = extractPatientId(hl7Message);

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
    requester: extractRequester(fields[12]),
  };

  return serviceRequest;
};
