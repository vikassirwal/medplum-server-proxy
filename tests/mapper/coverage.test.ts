import { HL7ToCoverageConverter } from '../../src/mapper/coverage';

describe('Coverage Mapper', () => {
  describe('HL7ToCoverageConverter', () => {
    it('should convert valid HL7 message to Coverage resource', () => {
      const hl7Message = [
        'MSH|^~\\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|20240101120000||ADT^A01|123456|P|2.5',
        'PID|1||123456||Doe^John||19900101|M|||123 Main St^^City^ST^12345||555-1234',
        'IN1|1|12345^MR|Insurance Company^L|Group Name|||||123456789||||20200101|20251231||John^Doe^SEL|123456|01|Self|123 Main St^^City^ST^12345||555-1234|20240101'
      ].join('\n');

      const result = HL7ToCoverageConverter(hl7Message);

      expect(result).toEqual({
        resourceType: 'Coverage',
        id: '12345',
        identifier: [{ value: '12345' }],
        status: 'active',
        beneficiary: { reference: 'Patient/123456' },
        subscriber: { reference: 'RelatedPerson/John' },
        subscriberId: 'John',
        relationship: {
          coding: [{ code: 'other', display: 'Other' }]
        },
        period: undefined,
        payor: [{
          display: 'Group Name'
        }],
        class: undefined
      });
    });

    it('should throw error for missing IN1 segment', () => {
      const hl7Message = [
        'MSH|^~\\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|20240101120000||ADT^A01|123456|P|2.5',
        'PID|1||123456||Doe^John||19900101|M|||123 Main St^^City^ST^12345||555-1234'
      ].join('\n');

      expect(() => HL7ToCoverageConverter(hl7Message)).toThrow('IN1 segment not found');
    });

    it('should handle relationship codes', () => {
      const hl7Message = [
        'MSH|^~\\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|20240101120000||ADT^A01|123456|P|2.5',
        'PID|1||123456||Doe^John||19900101|M|||123 Main St^^City^ST^12345||555-1234',
        'IN1|1|12345^MR|Insurance Company^L|Group Name|||||123456789||||20200101|20251231||John^Doe^01|123456|01|Self|123 Main St^^City^ST^12345||555-1234|20240101'
      ].join('\n');

      const result = HL7ToCoverageConverter(hl7Message);
      expect(result.relationship).toBeDefined();
      expect(result.relationship?.coding).toBeDefined();
      expect(result.relationship?.coding[0]).toHaveProperty('code');
      expect(result.relationship?.coding[0]).toHaveProperty('display');
    });
  });
});