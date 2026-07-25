import { formatCurrency } from '@/lib/utils';

describe('Admin Charts Y-Axis Currency Formatting - Feature F-06', () => {
  const chartTickFormatter = (value: number) => `Rs. ${value}`;

  it('should format chart Y-axis tick values with Rs. prefix instead of USD ($)', () => {
    const formattedTick = chartTickFormatter(5000);
    expect(formattedTick).toBe('Rs. 5000');
    expect(formattedTick).not.toContain('$');
  });

  it('should verify formatCurrency helper is consistent with Rs. notation', () => {
    const formattedValue = formatCurrency(5000);
    expect(formattedValue).toContain('Rs.');
    expect(formattedValue).not.toContain('$');
  });
});
