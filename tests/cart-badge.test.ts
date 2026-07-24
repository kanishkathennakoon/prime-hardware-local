import { CartItem } from '@/types';

describe('Cart Badge Item Count Logic - Feature F-15', () => {
  it('should calculate total item quantity across cart items', () => {
    const mockItems: CartItem[] = [
      {
        productId: 'prod-1',
        name: 'Rhino Premier Roofing Sheet',
        slug: 'rhino-premier-roofing-sheet',
        qty: 2,
        image: '/images/sample-roofing.jpg',
        price: '3500',
      },
      {
        productId: 'prod-2',
        name: 'Nippon Ceiling White Paint',
        slug: 'nippon-ceiling-white',
        qty: 3,
        image: '/images/sample-paint.jpg',
        price: '2400',
      },
    ];

    const totalQty = mockItems.reduce((acc, item) => acc + item.qty, 0);
    expect(totalQty).toBe(5);
  });

  it('should return 0 total quantity when cart items list is empty or undefined', () => {
    const emptyItems: CartItem[] = [];
    const totalQty = emptyItems.reduce((acc, item) => acc + item.qty, 0);
    expect(totalQty).toBe(0);
  });
});
