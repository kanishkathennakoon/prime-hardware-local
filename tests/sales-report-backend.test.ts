import { salesReportQuerySchema } from '@/lib/validators';
import { formatMonthlySales, calculateSalesKPIs } from '@/lib/utils/sales-report-helpers';
import { getSalesReportData } from '@/lib/actions/report.actions';
import { auth } from '@/auth';

// Mock auth module
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

// Mock prisma client
jest.mock('@/db/prisma', () => ({
  prisma: {
    order: {
      findMany: jest.fn(),
    },
  },
}));

import { prisma } from '@/db/prisma';

describe('Sales Report Backend - Feature F-01A', () => {
  describe('Zod Validation Schema (salesReportQuerySchema)', () => {
    it('should validate valid date strings', () => {
      const validData = {
        startDate: '2026-01-01',
        endDate: '2026-06-30',
      };
      const result = salesReportQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow optional empty/undefined date parameters', () => {
      const result = salesReportQuerySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject when startDate is after endDate', () => {
      const invalidData = {
        startDate: '2026-12-31',
        endDate: '2026-01-01',
      };
      const result = salesReportQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Start date cannot be after end date');
      }
    });
  });

  describe('Pure Calculation Helpers (sales-report-helpers)', () => {
    const mockOrders = [
      { id: '1', totalPrice: 100.5, createdAt: new Date('2026-01-15T10:00:00Z') },
      { id: '2', totalPrice: 200.0, createdAt: new Date('2026-01-20T12:00:00Z') },
      { id: '3', totalPrice: 150.0, createdAt: new Date('2026-02-05T14:00:00Z') },
    ];

    it('should format raw orders into monthly sales aggregates', () => {
      const monthlySales = formatMonthlySales(mockOrders);
      expect(monthlySales).toEqual([
        { month: '01/26', totalSales: 300.5, orderCount: 2 },
        { month: '02/26', totalSales: 150.0, orderCount: 1 },
      ]);
    });

    it('should compute KPI totals accurately', () => {
      const kpis = calculateSalesKPIs(mockOrders);
      expect(kpis.totalRevenue).toBe(450.5);
      expect(kpis.totalOrders).toBe(3);
      expect(kpis.averageOrderValue).toBe(150.17);
    });

    it('should handle empty orders list gracefully without division by zero', () => {
      const kpis = calculateSalesKPIs([]);
      expect(kpis.totalRevenue).toBe(0);
      expect(kpis.totalOrders).toBe(0);
      expect(kpis.averageOrderValue).toBe(0);
    });
  });

  describe('Server Action Authorization Guard (getSalesReportData)', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw or return error when user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const response = await getSalesReportData({});
      expect(response.success).toBe(false);
      expect(response.message).toContain('User is not authorized');
    });

    it('should throw or return error when user role is not admin', async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { role: 'user', id: '123' },
      });

      const response = await getSalesReportData({});
      expect(response.success).toBe(false);
      expect(response.message).toContain('User is not authorized');
    });

    it('should return sales report data when user is authorized admin', async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { role: 'admin', id: 'admin-123' },
      });

      (prisma.order.findMany as jest.Mock).mockResolvedValue([
        { id: '1', totalPrice: '100.00', createdAt: new Date('2026-01-15') },
      ]);

      const response = await getSalesReportData({
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      });

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.totalRevenue).toBe(100);
      expect(response.data?.totalOrders).toBe(1);
    });
  });
});
