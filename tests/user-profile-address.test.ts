import { updateProfileSchema } from '@/lib/validators';

describe('User Profile Address Schema & Actions - Feature F-09', () => {
  it('should validate profile updates with address fields', () => {
    const validProfileWithAddress = {
      name: 'John Doe',
      email: 'john@example.com',
      streetAddress: '123 Main Street',
      city: 'Colombo',
      postalCode: '00100',
      country: 'Sri Lanka',
    };

    const parsed = updateProfileSchema.safeParse(validProfileWithAddress);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.streetAddress).toBe('123 Main Street');
      expect(parsed.data.city).toBe('Colombo');
      expect(parsed.data.postalCode).toBe('00100');
      expect(parsed.data.country).toBe('Sri Lanka');
    }
  });

  it('should accept profile update without address fields (optional)', () => {
    const validProfileWithoutAddress = {
      name: 'Jane Doe',
      email: 'jane@example.com',
    };

    const parsed = updateProfileSchema.safeParse(validProfileWithoutAddress);
    expect(parsed.success).toBe(true);
  });
});
