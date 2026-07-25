import { customerAnalyticsQuerySchema } from '@/lib/validators';
import {
  calculateCustomerMetrics,
  calculateCustomerKPIs,
  filterAndSortCustomers,
  CustomerMetric,
} from '@/lib/utils/customer-analytics-helpers';
import { getCustomerAnalyticsData } from '@/lib/actions/report.actions';

// Mock auth module for server action testing
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

import { auth } from '@/auth';
const mockAuth = auth as unknown as jest.Mock;


describe('Customer Analytics Backend - Feature F-04', () => {
  describe('Zod Validation Schema (customerAnalyticsQuerySchema)', () => {
    it('should validate valid query parameters', () => {
      const validQuery = {
        sortBy: 'lifetime_spend_desc',
        minSpend: 50,
        minOrders: 2,
      };
      const result = customerAnalyticsQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should accept empty query object with defaults', () => {
      const result = customerAnalyticsQuerySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject invalid sortBy enum value', () => {
      const invalidQuery = { sortBy: 'invalid_sort_key' };
      const result = customerAnalyticsQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it('should reject negative minSpend or minOrders', () => {
      const result = customerAnalyticsQuerySchema.safeParse({ minSpend: -10, minOrders: -1 });
      expect(result.success).toBe(false);
    });
  });

  describe('Pure Metric Helpers (calculateCustomerMetrics & calculateCustomerKPIs)', () => {

    const mockUsers = [
      {
        id: 'user-1',
        name: 'Alice Cooper',
        email: 'alice@example.com',
        role: 'user',
        Order: [
          { id: 'order-1', totalPrice: '150.00', createdAt: new Date('2026-01-10') },
          { id: 'order-2', totalPrice: '250.00', createdAt: new Date('2026-03-15') },
        ],
      },
      {
        id: 'user-2',
        name: 'Bob Marley',
        email: 'bob@example.com',
        role: 'user',
        Order: [
          { id: 'order-3', totalPrice: '50.00', createdAt: new Date('2026-02-20') },
        ],
      },
      {
        id: 'user-3',
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        role: 'user',
        Order: [],
      },
    ];

    it('should compute metrics accurately for each customer', () => {
      const metrics = calculateCustomerMetrics(mockUsers as any);
      expect(metrics).toHaveLength(3);

      const alice = metrics.find((m) => m.userId === 'user-1');
      expect(alice).toBeDefined();
      expect(alice?.totalOrders).toBe(2);
      expect(alice?.totalSpend).toBe(400);
      expect(alice?.averageOrderValue).toBe(200);
      expect(alice?.lastOrderDate).toEqual(new Date('2026-03-15'));

      const charlie = metrics.find((m) => m.userId === 'user-3');
      expect(charlie?.totalOrders).toBe(0);
      expect(charlie?.totalSpend).toBe(0);
      expect(charlie?.averageOrderValue).toBe(0);
      expect(charlie?.lastOrderDate).toBeNull();
    });

    it('should calculate store aggregate customer KPIs correctly', () => {
      const metrics = calculateCustomerMetrics(mockUsers as any);
      const kpis = calculateCustomerKPIs(metrics);

      expect(kpis.totalCustomersCount).toBe(3);
      expect(kpis.activeCustomersCount).toBe(2);
      expect(kpis.totalCustomerSpend).toBe(450); // 400 + 50
      expect(kpis.averageSpendPerCustomer).toBe(225); // 450 / 2
      expect(kpis.repeatCustomerRate).toBe(50); // 1 out of 2 active customers has >1 order = 50%
    });

    it('should filter and sort customers according to criteria', () => {
      const metrics = calculateCustomerMetrics(mockUsers as any);

      // Filter minSpend = 100
      const highSpenders = filterAndSortCustomers(metrics, { minSpend: 100 });
      expect(highSpenders).toHaveLength(1);
      expect(highSpenders[0].userId).toBe('user-1');

      // Sort by order_count_desc
      const sortedByOrders = filterAndSortCustomers(metrics, { sortBy: 'order_count_desc' });
      expect(sortedByOrders[0].userId).toBe('user-1');
      expect(sortedByOrders[1].userId).toBe('user-2');
    });
  });

  describe('Server Action Security Guard (getCustomerAnalyticsData)', () => {
    it('should throw an error or return error response if user is unauthenticated', async () => {
      mockAuth.mockResolvedValueOnce(null as any);
      const result = await getCustomerAnalyticsData({});
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/not authorized/i);
    });

    it('should throw an error or return error response if user is not admin', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { role: 'user', email: 'regular@example.com' },
      } as any);

      const result = await getCustomerAnalyticsData({});
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/not authorized/i);
    });
  });
});


