import { formatCurrency } from '@/lib/utils';

describe('Currency Formatting Utility - Feature F-06', () => {
  it('should format numbers with Rs. prefix and 2 decimal places', () => {
    expect(formatCurrency(1250.5)).toContain('Rs.');
    expect(formatCurrency(1250.5)).toContain('1,250.50');
  });

  it('should format string numeric amounts with Rs. prefix', () => {
    expect(formatCurrency('99.9')).toBe('Rs. 99.90');
  });

  it('should handle zero amounts correctly', () => {
    expect(formatCurrency(0)).toBe('Rs. 0.00');
  });

  it('should handle null or invalid input gracefully', () => {
    expect(formatCurrency(null)).toBe('NaN');
  });
});
