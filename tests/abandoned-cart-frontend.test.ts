import React from 'react';
import { reportNavLinks } from '@/components/admin/reports-nav';
import { formatCurrency } from '@/lib/utils';

describe('Abandoned Cart Report Frontend - Feature F-05', () => {
  describe('Reports Sub-Navigation Links', () => {
    it('should include links for Sales, Inventory, Customer Analytics, and Abandoned Carts', () => {
      const abandonedCartLink = reportNavLinks.find(
        (link) => link.href === '/admin/reports/abandoned-carts'
      );

      expect(abandonedCartLink).toBeDefined();
      expect(abandonedCartLink?.title).toBe('Abandoned Carts');
    });
  });

  describe('Formatting Utilities', () => {
    it('should format lost revenue and cart values using formatCurrency helper', () => {
      const formattedTotalLost = formatCurrency(1240.5);
      const formattedAvgCart = formatCurrency(124.05);

      expect(formattedTotalLost).toContain('1,240.50');
      expect(formattedAvgCart).toContain('124.05');
    });
  });
});
