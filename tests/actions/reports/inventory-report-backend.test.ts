import { inventoryReportQuerySchema } from '@/lib/validators';
import {
  filterLowStockProducts,
  calculateTopSellingProducts,
  calculateInventoryKPIs,
} from '@/lib/utils/inventory-report-helpers';
import { getInventoryReportData } from '@/lib/actions/report.actions';
import { auth } from '@/auth';

// Mock auth module
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

// Mock prisma client
jest.mock('@/db/prisma', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    orderItem: {
      findMany: jest.fn(),
    },
  },
}));

import { prisma } from '@/db/prisma';

describe('Inventory Report Backend - Feature F-02A', () => {
  describe('Zod Validation Schema (inventoryReportQuerySchema)', () => {
    it('should validate valid query parameters', () => {
      const validData = {
        threshold: 10,
        category: "Men's Dress Shirts",
        sortBy: 'stock_asc',
      };
      const result = inventoryReportQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow optional empty/undefined parameters', () => {
      const result = inventoryReportQuerySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject negative threshold values', () => {
      const invalidData = { threshold: -5 };
      const result = inventoryReportQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Pure Calculation Helpers (inventory-report-helpers)', () => {
    const mockProducts = [
      { id: 'p1', name: 'Product A', category: 'Cat1', stock: 2, price: 50 },
      { id: 'p2', name: 'Product B', category: 'Cat1', stock: 15, price: 100 },
      { id: 'p3', name: 'Product C', category: 'Cat2', stock: 0, price: 75 },
    ];

    const mockOrderItems = [
      { productId: 'p1', qty: 5, price: 50 },
      { productId: 'p1', qty: 3, price: 50 },
      { productId: 'p2', qty: 2, price: 100 },
    ];

    it('should filter low-stock items correctly based on threshold', () => {
      const lowStockItems = filterLowStockProducts(mockProducts as any, 10);
      expect(lowStockItems.length).toBe(2); // p3 (0 stock) and p1 (2 stock)
      expect(lowStockItems[0].id).toBe('p3'); // sorted stock asc
      expect(lowStockItems[1].id).toBe('p1');
    });

    it('should calculate top selling products ranked by order volume', () => {
      const topSelling = calculateTopSellingProducts(mockProducts as any, mockOrderItems as any);
      expect(topSelling.length).toBe(2);
      expect(topSelling[0].productId).toBe('p1');
      expect(topSelling[0].totalQtySold).toBe(8);
      expect(topSelling[0].totalRevenueGenerated).toBe(400);
      expect(topSelling[1].productId).toBe('p2');
      expect(topSelling[1].totalQtySold).toBe(2);
    });

    it('should compute inventory KPI metrics accurately', () => {
      const kpis = calculateInventoryKPIs(mockProducts as any, 10);
      expect(kpis.totalProductsCount).toBe(3);
      expect(kpis.lowStockCount).toBe(2);
      expect(kpis.outOfStockCount).toBe(1);
      expect(kpis.totalStockQuantity).toBe(17);
    });
  });

  describe('Server Action Authorization Guard (getInventoryReportData)', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return error when user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const response = await getInventoryReportData({});
      expect(response.success).toBe(false);
      expect(response.message).toContain('User is not authorized');
    });

    it('should return error when user role is not admin', async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { role: 'user', id: '123' },
      });

      const response = await getInventoryReportData({});
      expect(response.success).toBe(false);
      expect(response.message).toContain('User is not authorized');
    });

    it('should return inventory report data when user is authorized admin', async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { role: 'admin', id: 'admin-123' },
      });

      (prisma.product.findMany as jest.Mock).mockResolvedValue([
        { id: 'p1', name: 'Product A', category: 'Cat1', stock: 2, price: '50.00' },
      ]);
      (prisma.product.groupBy as jest.Mock).mockResolvedValue([{ category: 'Cat1' }]);
      (prisma.orderItem.findMany as jest.Mock).mockResolvedValue([
        { productId: 'p1', qty: 5, price: '50.00' },
      ]);

      const response = await getInventoryReportData({ threshold: 10 });

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.kpis.totalProductsCount).toBe(1);
      expect(response.data?.lowStockItems.length).toBe(1);
    });
  });
});
