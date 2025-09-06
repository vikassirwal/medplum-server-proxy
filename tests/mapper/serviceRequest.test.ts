import { HL7ToServiceRequestConverter } from '../../src/mapper/serviceRequest';

describe('ServiceRequest Mapper', () => {
  describe('HL7ToServiceRequestConverter', () => {
    it('should convert OBR segment to ServiceRequest resource', () => {
      const hl7Message = [
        'MSH|^~\\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|20240101120000||ADT^A01|123456|P|2.5',
        'PID|1||123456||Doe^John||19900101|M|||123 Main St^^City^ST^12345||555-1234',
        'OBR|1|12345^MR|45678^LAB|CBC^Complete Blood Count^L|||20240101120000|||||||||DOC123^Smith^Jane|||||20240101120000'
      ].join('\n');

      const result = HL7ToServiceRequestConverter(hl7Message);

      expect(result).toEqual({
        resourceType: 'ServiceRequest',
        id: '12345',
        identifier: [{ value: '12345' }],
        status: 'active',
        intent: 'order',
        category: [{
          coding: [{
            code: '3457005',
            display: 'Patient referral'
          }]
        }],
        code: {
          coding: [{
            code: 'CBC',
            display: 'Complete Blood Count'
          }]
        },
        subject: { reference: 'Patient/123456' },
        requester: undefined
      });
    });

    it('should convert ORC segment to ServiceRequest resource', () => {
      const hl7Message = [
        'MSH|^~\\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|20240101120000||ADT^A01|123456|P|2.5',
        'PID|1||123456||Doe^John||19900101|M|||123 Main St^^City^ST^12345||555-1234',
        'ORC|NW|12345^MR|45678^LAB|SC|F|||||20240101120000|DOC123^Smith^Jane|||||20240101120000'
      ].join('\n');

      const result = HL7ToServiceRequestConverter(hl7Message);

      expect(result).toEqual({
        resourceType: 'ServiceRequest',
        id: '12345',
        identifier: [{ value: '12345' }],
        status: 'active',
        intent: 'order',
        category: [{
          coding: [{
            code: '3457005',
            display: 'Patient referral'
          }]
        }],
        code: {
          coding: [{
            code: 'SC',
            display: 'SC'
          }]
        },
        subject: { reference: 'Patient/123456' },
        requester: undefined
      });
    });

    it('should throw error for missing segments', () => {
      const hl7Message = [
        'MSH|^~\\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|20240101120000||ADT^A01|123456|P|2.5',
        'PID|1||123456||Doe^John||19900101|M|||123 Main St^^City^ST^12345||555-1234'
      ].join('\n');

      expect(() => HL7ToServiceRequestConverter(hl7Message)).toThrow('OBR or ORC segment not found');
    });

    it('should default to active status', () => {
      const hl7Message = [
        'MSH|^~\\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|20240101120000||ADT^A01|123456|P|2.5',
        'PID|1||123456||Doe^John||19900101|M|||123 Main St^^City^ST^12345||555-1234',
        'OBR|1|12345^MR|45678^LAB|CBC^Complete Blood Count^L|||20240101120000|||||||||DOC123^Smith^Jane|||||20240101120000'
      ].join('\n');

      const result = HL7ToServiceRequestConverter(hl7Message);
      expect(result.status).toBe('active');
    });
  });
});