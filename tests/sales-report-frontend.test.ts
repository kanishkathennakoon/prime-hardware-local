import React from 'react';
import { adminNavLinks } from '@/app/admin/main-nav';
import { formatCurrency } from '@/lib/utils';

describe('Sales Report Frontend - Feature F-01B', () => {
  describe('Admin Navigation Links', () => {
    it('should include a Reports navigation link pointing to /admin/reports/sales', () => {
      const reportsLink = adminNavLinks.find((link) => link.href === '/admin/reports/sales');
      expect(reportsLink).toBeDefined();
      expect(reportsLink?.title).toBe('Reports');
    });
  });

  describe('Currency & KPI Formatting', () => {
    it('should format revenue and AOV using formatCurrency helper', () => {
      const formattedRevenue = formatCurrency(1250.5);
      const formattedAOV = formatCurrency(125.05);

      expect(formattedRevenue).toContain('1,250.50');
      expect(formattedAOV).toContain('125.05');
    });
  });
});
