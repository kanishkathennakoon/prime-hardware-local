import React from 'react';
import { reportNavLinks } from '@/components/admin/reports-nav';
import { getStockBadgeStatus } from '@/lib/utils/inventory-report-helpers';

describe('Inventory Report Frontend - Feature F-02B', () => {
  describe('Reports Sub-Navigation Links', () => {
    it('should include links for Sales Report and Inventory Report', () => {
      const salesLink = reportNavLinks.find((link) => link.href === '/admin/reports/sales');
      const inventoryLink = reportNavLinks.find((link) => link.href === '/admin/reports/inventory');

      expect(salesLink).toBeDefined();
      expect(salesLink?.title).toBe('Sales Report');

      expect(inventoryLink).toBeDefined();
      expect(inventoryLink?.title).toBe('Inventory Report');
    });
  });

  describe('Stock Badge Status Helper', () => {
    it('should return out_of_stock when stock is 0', () => {
      const status = getStockBadgeStatus(0, 10);
      expect(status).toBe('out_of_stock');
    });

    it('should return low_stock when stock is <= threshold', () => {
      const status = getStockBadgeStatus(5, 10);
      expect(status).toBe('low_stock');
    });

    it('should return in_stock when stock is > threshold', () => {
      const status = getStockBadgeStatus(25, 10);
      expect(status).toBe('in_stock');
    });
  });
});
