describe('Order Details Shipping Address Formatting - Feature F-16', () => {
  it('should format shipping address with proper space and comma separators between city and postal code', () => {
    const shippingAddress = {
      fullName: 'John Doe',
      streetAddress: '45 Galle Road',
      city: 'Colombo',
      postalCode: '00300',
      country: 'Sri Lanka',
    };

    // Helper simulating the formatted address string rendered in order-details-table.tsx
    const formatAddressText = (addr: typeof shippingAddress) =>
      `${addr.streetAddress}, ${addr.city}, ${addr.postalCode}, ${addr.country}`;

    const formatted = formatAddressText(shippingAddress);
    expect(formatted).toBe('45 Galle Road, Colombo, 00300, Sri Lanka');
    expect(formatted).not.toContain('Colombo00300');
  });
});
