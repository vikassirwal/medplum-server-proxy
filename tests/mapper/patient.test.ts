import { HL7ToPatientConverter } from '../../src/mapper/patient';

describe('Patient Mapper', () => {
  describe('HL7ToPatientConverter', () => {
    it('should convert valid HL7 message to Patient resource', () => {
      const hl7Message = [
        'MSH|^~\\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|20240101120000||ADT^A01|123456|P|2.5',
        'PID|1||123456||Doe^John||19900101|M|||123 Main St^^City^ST^12345||555-1234'
      ].join('\n');

      const result = HL7ToPatientConverter(hl7Message);

      expect(result).toEqual({
        resourceType: 'Patient',
        id: '123456',
        identifier: [{ value: '123456' }],
        name: [{ family: 'Doe', given: ['John'] }],
        birthDate: '1990-01-01',
        gender: 'male',
        address: [{
          line: ['123 Main St'],
          city: 'City',
          state: 'ST',
          postalCode: '12345'
        }],
        telecom: [{ system: 'phone', value: '555-1234' }]
      });
    });

    it('should throw error for missing PID segment', () => {
      const hl7Message = 'MSH|^~\\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|20240101120000||ADT^A01|123456|P|2.5';

      expect(() => HL7ToPatientConverter(hl7Message)).toThrow('PID segment not found');
    });

    it('should handle different gender values', () => {
      const testCases = [
        { gender: 'M', expected: 'male' },
        { gender: 'F', expected: 'female' },
        { gender: 'O', expected: 'other' },
        { gender: 'U', expected: 'unknown' },
        { gender: 'X', expected: undefined },
      ];

      testCases.forEach(({ gender, expected }) => {
        const hl7Message = [
          'MSH|^~\\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|20240101120000||ADT^A01|123456|P|2.5',
          `PID|1||123456||Doe^John||19900101|${gender}|||123 Main St^^City^ST^12345||555-1234`
        ].join('\n');

        const result = HL7ToPatientConverter(hl7Message);
        expect(result.gender).toBe(expected);
      });
    });

    it('should handle missing optional fields', () => {
      const hl7Message = [
        'MSH|^~\\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|20240101120000||ADT^A01|123456|P|2.5',
        'PID|1||123456'
      ].join('\n');

      const result = HL7ToPatientConverter(hl7Message);

      expect(result).toEqual({
        resourceType: 'Patient',
        id: '123456',
        identifier: [{ value: '123456' }],
        name: undefined,
        birthDate: undefined,
        gender: undefined,
        address: undefined,
        telecom: undefined
      });
    });
  });
});