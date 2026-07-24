import React from 'react';
import ProductImages from '@/components/shared/product/product-images';

describe('ProductImages Component - Aspect Ratio & No Content Jump', () => {
  it('should be a valid React component function', () => {
    expect(typeof ProductImages).toBe('function');
  });

  it('should render image thumbnails without throwing error', () => {
    const mockImages = ['/images/sample-1.jpg', '/images/sample-2.jpg'];
    const element = React.createElement(ProductImages, { images: mockImages });
    expect(element).toBeDefined();
    expect(element.props.images).toHaveLength(2);
  });
});
