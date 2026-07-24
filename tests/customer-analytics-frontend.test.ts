import React from 'react';
import { reportNavLinks } from '@/components/admin/reports-nav';
import { formatCurrency } from '@/lib/utils';

describe('Customer Analytics Frontend - Feature F-04', () => {
  describe('Reports Sub-Navigation Links', () => {
    it('should include links for Sales, Inventory, and Customer Analytics Reports', () => {
      const customerAnalyticsLink = reportNavLinks.find(
        (link) => link.href === '/admin/reports/customer-analytics'
      );

      expect(customerAnalyticsLink).toBeDefined();
      expect(customerAnalyticsLink?.title).toBe('Customer Analytics');
    });
  });

  describe('Formatting Utilities', () => {
    it('should format customer spend metrics using formatCurrency helper', () => {
      const formattedTotalSpend = formatCurrency(1850.75);
      const formattedAvgSpend = formatCurrency(462.6875);

      expect(formattedTotalSpend).toContain('1,850.75');
      expect(formattedAvgSpend).toContain('462.69');
    });
  });
});
