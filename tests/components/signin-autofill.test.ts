import { signInDefaultValues } from '@/lib/constants';

describe('Sign-in Form Default Values - Feature F-07', () => {
  it('should have empty string defaults for email and password to prevent admin credential autofill', () => {
    expect(signInDefaultValues.email).toBe('');
    expect(signInDefaultValues.password).toBe('');
  });
});
