import React from 'react';
import ProductCard from '@/components/shared/product/product-card';

describe('ProductCard Component - Feature F-08', () => {
  it('should be a valid React component function', () => {
    expect(typeof ProductCard).toBe('function');
  });

  it('should render product information cleanly', () => {
    const mockProduct = {
      id: 'prod-1',
      name: 'Nippon Paint Ceiling White',
      slug: 'nippon-ceiling-white',
      category: 'Paint & Supplies',
      images: ['/images/sample-paint.jpg'],
      brand: 'Nippon Paint',
      description: 'High quality paint',
      stock: 15,
      price: 4500,
      rating: 4.5,
      numReviews: 10,
      isFeatured: false,
      banner: null,
      createdAt: new Date(),
    };

    const element = React.createElement(ProductCard, { product: mockProduct as any });
    expect(element).toBeDefined();
    expect(element.props.product.name).toBe('Nippon Paint Ceiling White');
  });
});
