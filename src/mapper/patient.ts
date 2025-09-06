import { PatientResourceDto } from '../dto/resource.dto';

const extractId = (field: string): string | undefined => {
  return field?.split('^')[0];
};

const createPatientIdentifier = (field: string): { value: string }[] | undefined => {
  return [{ value: field?.split('^')[0] }];
};

const extractName = (field: string): { family: string; given: string[] }[] | undefined => {
  if (!field) return undefined;

  const nameComponents = field.split('^');
  return [{
    family: nameComponents[0] || '',
    given: nameComponents[1] ? [nameComponents[1]] : [],
  }];
};

const extractBirthDate = (field: string): string | undefined => {
  if (!field || field.length < 8) return undefined;

  // Convert YYYYMMDD to YYYY-MM-DD
  const year = field.substring(0, 4);
  const month = field.substring(4, 6);
  const day = field.substring(6, 8);

  return `${year}-${month}-${day}`;
};

const extractGender = (field: string): 'male' | 'female' | 'other' | 'unknown' | undefined => {
  const genderMap: { [key: string]: 'male' | 'female' | 'other' | 'unknown' } = {
    'M': 'male',
    'F': 'female',
    'O': 'other',
    'U': 'unknown',
  };

  return field ? genderMap[field.toUpperCase()] : undefined;
};

const extractAddress = (field: string): { line: string[]; city: string; state: string; postalCode: string }[] | undefined => {
  if (!field) return undefined;

  const addrComponents = field.split('^');
  return [{
    line: addrComponents[0] ? [addrComponents[0]] : [],
    city: addrComponents[2] || '',
    state: addrComponents[3] || '',
    postalCode: addrComponents[4] || '',
  }];
};

const extractPhone = (field: string): { system: string; value: string }[] | undefined => {
  if (!field) return undefined;

  return [{
    system: 'phone',
    value: field,
  }];
};

export const HL7ToPatientConverter = (hl7Message: string): PatientResourceDto => {
  const lines = hl7Message.split('\n');
  const pidLine = lines.find(line => line.startsWith('PID'));

  if (!pidLine) {
    throw new Error('PID segment not found');
  }

  const fields = pidLine.split('|');

  const patient: PatientResourceDto = {
    resourceType: 'Patient',
    id: extractId(fields[3]),
    identifier: createPatientIdentifier(fields[3]),
    name: extractName(fields[5]),
    birthDate: extractBirthDate(fields[7]),
    gender: extractGender(fields[8]),
    address: extractAddress(fields[11]),
    telecom: extractPhone(fields[13]),
  };

  return patient;
};
