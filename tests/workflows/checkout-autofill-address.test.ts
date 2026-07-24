import { shippingAddressSchema } from '@/lib/validators';

describe('Checkout Shipping Address Profile Autofill - Feature F-10', () => {
  it('should correctly format user profile address data for checkout default values', () => {
    const userProfileData = {
      name: 'Isuru Perera',
      email: 'isuru@example.com',
      address: {
        fullName: 'Isuru Perera',
        streetAddress: '45 Galle Road',
        city: 'Colombo',
        postalCode: '00300',
        country: 'Sri Lanka',
      },
    };

    const checkoutShippingAddress = {
      fullName: userProfileData.address?.fullName || userProfileData.name || '',
      streetAddress: userProfileData.address?.streetAddress || '',
      city: userProfileData.address?.city || '',
      postalCode: userProfileData.address?.postalCode || '',
      country: userProfileData.address?.country || '',
    };

    const parsed = shippingAddressSchema.safeParse(checkoutShippingAddress);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.fullName).toBe('Isuru Perera');
      expect(parsed.data.streetAddress).toBe('45 Galle Road');
      expect(parsed.data.city).toBe('Colombo');
      expect(parsed.data.postalCode).toBe('00300');
      expect(parsed.data.country).toBe('Sri Lanka');
    }
  });

  it('should fallback to user name when address fullName is missing', () => {
    const userProfileData: {
      name: string;
      email: string;
      address?: {
        fullName?: string;
        streetAddress?: string;
        city?: string;
        postalCode?: string;
        country?: string;
      };
    } = {
      name: 'Kanishka Thennakoon',
      email: 'kanishka@example.com',
      address: {
        streetAddress: '78 Kandy Road',
        city: 'Kandy',
        postalCode: '20000',
        country: 'Sri Lanka',
      },
    };


    const checkoutShippingAddress = {
      fullName: userProfileData.address?.fullName || userProfileData.name || '',
      streetAddress: userProfileData.address?.streetAddress || '',
      city: userProfileData.address?.city || '',
      postalCode: userProfileData.address?.postalCode || '',
      country: userProfileData.address?.country || '',
    };

    expect(checkoutShippingAddress.fullName).toBe('Kanishka Thennakoon');
    expect(checkoutShippingAddress.streetAddress).toBe('78 Kandy Road');
  });
});
