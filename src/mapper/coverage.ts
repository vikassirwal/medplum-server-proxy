import { CoverageResourceDto } from '../dto/resource.dto';


const extractId = (field: string): string | undefined => {
  return field?.split('^')[0];
};

const createCoverageIdentifier = (field: string): { value: string }[] | undefined => {
  return [{ value: field?.split('^')[0] }];
};

const extractSubscriber = (nameField: string, relationField: string): { reference: string } | undefined => {
  // If relationship is 'self', subscriber is the patient
  if (relationField === '18' || relationField === 'SEL') {
    return undefined; // Same as beneficiary
  }

  return nameField ? { reference: `RelatedPerson/${nameField.split('^')[0]}` } : undefined;
};

const extractSubscriberId = (field: string): string | undefined => {
  return field?.split('^')[0];
};

const extractRelationship = (field: string): { coding: { code: string; display: string }[] } | undefined => {
  if (!field) return undefined;

  const relationshipMap: { [key: string]: string } = {
    '01': 'self',
    '02': 'spouse',
    '03': 'child',
    '04': 'natural child',
    '05': 'step child',
    '18': 'self',
    'SEL': 'self',
    'SPO': 'spouse',
    'CHD': 'child',
  };

  const displayMap: { [key: string]: string } = {
    '01': 'Self',
    '02': 'Spouse',
    '03': 'Child',
    '04': 'Natural Child',
    '05': 'Step Child',
    '18': 'Self',
    'SEL': 'Self',
    'SPO': 'Spouse',
    'CHD': 'Child',
  };

  const code = relationshipMap[field] || 'other';
  const display = displayMap[field] || 'Other';

  return {
    coding: [{
      code: code,
      display: display,
    }],
  };
};

const extractPeriod = (startField: string, endField: string): { start: string; end?: string } | undefined => {
  if (!startField) return undefined;

  const start = convertDate(startField);
  const end = endField ? convertDate(endField) : undefined;

  return start ? { start, end } : undefined;
};

const extractPayor = (companyField: string, nameField: string): { reference?: string; display?: string }[] => {
  const display = nameField || companyField;

  return [{
    display: display || 'Unknown Insurance',
  }];
};

const extractClass = (field: string): { type: { code: string }; value: string; name?: string }[] | undefined => {
  if (!field) return undefined;

  const groupNumber = field.split('^')[0];

  return [{
    type: { code: 'group' },
    value: groupNumber,
    name: 'Group Number',
  }];
};

const convertDate = (hl7Date: string): string | undefined => {
  if (!hl7Date || hl7Date.length < 8) return undefined;

  // Convert YYYYMMDD to YYYY-MM-DD
  const year = hl7Date.substring(0, 4);
  const month = hl7Date.substring(4, 6);
  const day = hl7Date.substring(6, 8);

  return `${year}-${month}-${day}`;
};


const extractPatientId = (hl7Message: string): string => {
  const lines = hl7Message.split('\n');
  const pidLine = lines.find(line => line.startsWith('PID'));

  if (!pidLine) {
    throw new Error('PID segment not found - cannot extract patient ID');
  }

  const fields = pidLine.split('|');
  const patientId = extractId(fields[3]);

  if (!patientId) {
    throw new Error('Patient ID not found in PID segment');
  }

  return patientId;
};

export const HL7ToCoverageConverter = (hl7Message: string): CoverageResourceDto => {
  const lines = hl7Message.split('\n');
  const in1Line = lines.find(line => line.startsWith('IN1'));

  if (!in1Line) {
    throw new Error('IN1 segment not found');
  }

  // Extract patient ID from the HL7 message
  const patientId = extractPatientId(hl7Message);
  const fields = in1Line.split('|');

  const coverage: CoverageResourceDto = {
    resourceType: 'Coverage',
    id: extractId(fields[2]),
    identifier: createCoverageIdentifier(fields[2]),
    status: 'active',
    beneficiary: { reference: `Patient/${patientId}` },
    subscriber: extractSubscriber(fields[16], fields[17]),
    subscriberId: extractSubscriberId(fields[36]),
    relationship: extractRelationship(fields[17]),
    period: extractPeriod(fields[12], fields[13]),
    payor: extractPayor(fields[3], fields[4]),
    class: extractClass(fields[35]),
  };

  return coverage;
};
