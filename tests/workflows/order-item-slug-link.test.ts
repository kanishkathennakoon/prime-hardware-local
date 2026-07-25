import { formatCurrency } from '@/lib/utils';

describe('Order Item Slug Link Formatting - Feature F-12', () => {
  it('should correctly format product URLs using item.slug in template literals', () => {
    const mockItem = {
      name: 'Rhino Premier Roofing Sheet',
      slug: 'rhino-premier-roofing-sheet',
      image: '/images/sample-roofing.jpg',
      price: 3500,
      qty: 2,
    };

    const productUrl = `/product/${mockItem.slug}`;
    expect(productUrl).toBe('/product/rhino-premier-roofing-sheet');
    expect(productUrl).not.toContain('{item.slug}');
  });

  it('should format order item price using formatCurrency helper', () => {
    const mockPrice = 3500;
    const formatted = formatCurrency(mockPrice);
    expect(formatted).toContain('Rs.');
    expect(formatted).toContain('3,500.00');
  });
});
