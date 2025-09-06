export interface PatientResourceDto {
    resourceType: 'Patient';
    identifier?: { value: string }[];
    id?: string;
    name?: { family: string; given: string[] }[];
    gender?: 'male' | 'female' | 'other' | 'unknown';
    birthDate?: string;
    telecom?: { system: string; value: string }[];
    address?: { line: string[]; city: string; state: string; postalCode: string }[];
}

export interface CoverageResourceDto {
    resourceType: 'Coverage';
    id?: string;
    identifier?: { value: string }[];
    status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';
    beneficiary: { reference: string };
    subscriber?: { reference: string };
    subscriberId?: string;
    relationship?: { coding: { code: string; display: string }[] };
    period?: { start: string; end?: string };
    payor: { reference?: string; display?: string }[];
    class?: { type: { code: string }; value: string; name?: string }[];
}

export interface ServiceRequestResourceDto {
    resourceType: 'ServiceRequest';
    id?: string;
    identifier?: { value: string }[];
    status: 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed' | 'entered-in-error' | 'unknown';
    intent: 'proposal' | 'plan' | 'directive' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
    category?: { coding: { code: string; display: string }[] }[];
    code?: { coding: { code: string; display: string }[] };
    subject: { reference: string };
    requester?: { reference: string };
    performer?: { reference: string }[];
    priority?: 'routine' | 'urgent' | 'asap' | 'stat';
    reasonCode?: { coding: { code: string; display: string }[] }[];
  }
