import { validateHL7Message } from '../../src/services/validateHl7';

describe('ValidateHl7', () => {
  describe('validateHL7Message', () => {
    it('should validate correct HL7 message', () => {
      const validMessage = 'MSH|^~\\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|20240101120000||ADT^A01|123456|P|2.5\r\nPID|1||123456||Doe^John||19900101|M|||123 Main St^^City^ST^12345||555-1234';

      const errors = validateHL7Message(validMessage);

      expect(errors).toEqual([]);
    });

    it('should reject empty message', () => {
      const errors = validateHL7Message('');

      expect(errors).toEqual([
        { field: 'message', message: 'Message cannot be empty' }
      ]);
    });

    it('should require MSH segment first', () => {
      const invalidMessage = 'PID|1||123456||Doe^John\r\nMSH|^~\\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|20240101120000||ADT^A01|123456|P|2.5';

      const errors = validateHL7Message(invalidMessage);

      expect(errors).toContainEqual({
        field: 'MSH',
        message: 'First segment must be MSH'
      });
    });

    it('should validate MSH segment structure', () => {
      const shortMshSegment = 'MSH|^~\\&|App';

      const errors = validateHL7Message(shortMshSegment);

      expect(errors).toContainEqual({
        field: 'MSH',
        message: 'MSH segment too short: 3 fields, expected at least 5'
      });
    });

    it('should validate segment format', () => {
      const invalidSegment = 'MSH|^~\\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|20240101120000||ADT^A01|123456|P|2.5\r\nAB|invalid segment';

      const errors = validateHL7Message(invalidSegment);

      expect(errors).toContainEqual({
        field: 'segment[1]',
        message: 'Invalid segment ID: AB|'
      });
    });
  });
});