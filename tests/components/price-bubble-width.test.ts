import fs from 'fs';
import path from 'path';

describe('Product Price Bubble Width - Feature F-18', () => {
  it('should use dynamic width (w-fit whitespace-nowrap) instead of fixed width (w-24) on product detail page price bubble', () => {
    const filePath = path.join(process.cwd(), 'app', '(root)', 'product', '[slug]', 'page.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    // Should contain dynamic fit width class
    expect(content).toMatch(/w-fit/);
    expect(content).toMatch(/whitespace-nowrap/);

    // Should not use fixed restrictive width w-24 on ProductPrice
    expect(content).not.toMatch(/className='w-24/);
  });
});
