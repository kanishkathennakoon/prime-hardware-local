import {
  getSalesReportData,
  getInventoryReportData,
  getCustomerAnalyticsData,
  getAbandonedCartReportData,
} from '@/lib/actions/report.actions';
import { auth } from '@/auth';

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

describe('Unified Admin Management Reports Integration & RBAC - Feature F-21', () => {
  describe('RBAC Authorization Guards for Non-Admin Users', () => {
    beforeEach(() => {
      // Mock unauthenticated or non-admin session
      (auth as jest.Mock).mockResolvedValue({
        user: { name: 'Regular Customer', email: 'user@example.com', role: 'user' },
      });
    });

    it('should reject Sales Report access for non-admin users', async () => {
      const res = await getSalesReportData({});
      expect(res.success).toBe(false);
      expect(res.message || res.error).toMatch(/authorized/i);
    });

    it('should reject Inventory Report access for non-admin users', async () => {
      const res = await getInventoryReportData({});
      expect(res.success).toBe(false);
      expect(res.message || res.error).toMatch(/authorized/i);
    });

    it('should reject Customer Analytics access for non-admin users', async () => {
      const res = await getCustomerAnalyticsData({});
      expect(res.success).toBe(false);
      expect(res.message || res.error).toMatch(/authorized/i);
    });

    it('should reject Abandoned Cart Report access for non-admin users', async () => {
      const res = await getAbandonedCartReportData({});
      expect(res.success).toBe(false);
      expect(res.message || res.error).toMatch(/authorized/i);
    });
  });

  describe('Report Data Access for Authorized Admin Users', () => {
    beforeEach(() => {
      // Mock authenticated admin session
      (auth as jest.Mock).mockResolvedValue({
        user: { name: 'Admin User', email: 'admin@example.com', role: 'admin' },
      });
    });

    it('should return valid Sales Report data for admin users', async () => {
      const res = await getSalesReportData({});
      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.data?.monthlySales).toBeDefined();
      expect(res.data?.totalRevenue).toBeGreaterThanOrEqual(0);
    });

    it('should return valid Inventory Report data for admin users', async () => {
      const res = await getInventoryReportData({ threshold: 10 });
      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.data?.lowStockItems).toBeDefined();
      expect(res.data?.topSellingItems).toBeDefined();
    });

    it('should return valid Customer Analytics data for admin users', async () => {
      const res = await getCustomerAnalyticsData({});
      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.data?.customers).toBeDefined();
    });

    it('should return valid Abandoned Cart Report data for admin users', async () => {
      const res = await getAbandonedCartReportData({ thresholdHours: 24 });
      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.data?.abandonedCarts).toBeDefined();
    });
  });
});
