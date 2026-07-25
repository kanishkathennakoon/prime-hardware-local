import { formatCurrency } from '@/lib/utils';
import { CartItem } from '@/types';

describe('Shopping Cart Item Price Formatting - Feature F-06', () => {
  it('should format individual cart item prices using formatCurrency helper with Rs.', () => {
    const item: CartItem = {
      productId: 'prod-1',
      name: 'Sanding Machine 500W',
      slug: 'sanding-machine-500w',
      qty: 1,
      image: '/images/sample.jpg',
      price: '12500.00',
    };

    const formattedPrice = formatCurrency(item.price);
    expect(formattedPrice).toBe('Rs. 12,500.00');
    expect(formattedPrice).not.toContain('$');
  });
});
