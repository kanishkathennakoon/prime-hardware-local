import { abandonedCartReportQuerySchema } from '@/lib/validators';
import {
  filterAbandonedCarts,
  calculateAbandonedCartKPIs,
  sortAbandonedCarts,
  AbandonedCartRecord,
} from '@/lib/utils/abandoned-cart-helpers';
import { getAbandonedCartReportData } from '@/lib/actions/report.actions';

// Mock auth module
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

import { auth } from '@/auth';
const mockAuth = auth as unknown as jest.Mock;

describe('Abandoned Cart Report Backend - Feature F-05', () => {
  describe('Zod Validation Schema (abandonedCartReportQuerySchema)', () => {
    it('should validate valid query parameters', () => {
      const validQuery = {
        thresholdHours: 48,
        sortBy: 'total_price_desc',
      };
      const result = abandonedCartReportQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should accept empty query with default values', () => {
      const result = abandonedCartReportQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.thresholdHours).toBe(24);
        expect(result.data.sortBy).toBe('created_at_desc');
      }
    });

    it('should reject invalid sortBy value', () => {
      const result = abandonedCartReportQuerySchema.safeParse({ sortBy: 'invalid_sort' });
      expect(result.success).toBe(false);
    });

    it('should reject negative thresholdHours', () => {
      const result = abandonedCartReportQuerySchema.safeParse({ thresholdHours: -5 });
      expect(result.success).toBe(false);
    });
  });

  describe('Pure Calculation Helpers (filterAbandonedCarts & calculateAbandonedCartKPIs)', () => {
    const referenceNow = new Date('2026-07-24T12:00:00.000Z');
    const cutoff24h = new Date('2026-07-23T12:00:00.000Z');

    const mockRawCarts = [
      {
        id: 'cart-1',
        userId: 'user-1',
        sessionCartId: 'session-1',
        items: [
          { productId: 'p1', name: 'Hammer', qty: 2, price: '25.00' },
          { productId: 'p2', name: 'Drill', qty: 1, price: '100.00' },
        ],
        itemsPrice: '150.00',
        totalPrice: '165.00',
        shippingPrice: '10.00',
        taxPrice: '5.00',
        createdAt: new Date('2026-07-20T10:00:00.000Z'), // Older than 24h -> Abandoned
        user: { name: 'John Doe', email: 'john@example.com' },
      },
      {
        id: 'cart-2',
        userId: null,
        sessionCartId: 'session-guest',
        items: [
          { productId: 'p3', name: 'Screwdriver', qty: 1, price: '15.00' },
        ],
        itemsPrice: '15.00',
        totalPrice: '20.00',
        shippingPrice: '5.00',
        taxPrice: '0.00',
        createdAt: new Date('2026-07-22T08:00:00.000Z'), // Older than 24h -> Abandoned
        user: null,
      },
      {
        id: 'cart-3',
        userId: 'user-2',
        sessionCartId: 'session-recent',
        items: [{ productId: 'p4', name: 'Saw', qty: 1, price: '50.00' }],
        itemsPrice: '50.00',
        totalPrice: '55.00',
        shippingPrice: '5.00',
        taxPrice: '0.00',
        createdAt: new Date('2026-07-24T11:00:00.000Z'), // Just created 1h ago -> NOT Abandoned
        user: { name: 'Jane Smith', email: 'jane@example.com' },
      },
      {
        id: 'cart-4',
        userId: 'user-3',
        sessionCartId: 'session-empty',
        items: [], // Empty cart -> NOT Abandoned
        itemsPrice: '0.00',
        totalPrice: '0.00',
        shippingPrice: '0.00',
        taxPrice: '0.00',
        createdAt: new Date('2026-07-21T10:00:00.000Z'),
        user: { name: 'Bob', email: 'bob@example.com' },
      },
    ];

    it('should correctly filter abandoned carts older than threshold hours', () => {
      const abandoned = filterAbandonedCarts(mockRawCarts as any, 24, referenceNow);
      expect(abandoned).toHaveLength(2);
      expect(abandoned.map((c) => c.id)).toContain('cart-1');
      expect(abandoned.map((c) => c.id)).toContain('cart-2');
    });

    it('should compute aggregate KPIs accurately', () => {
      const abandoned = filterAbandonedCarts(mockRawCarts as any, 24, referenceNow);
      const kpis = calculateAbandonedCartKPIs(abandoned);

      expect(kpis.totalAbandonedCartsCount).toBe(2);
      expect(kpis.totalLostRevenue).toBe(185); // 165 + 20
      expect(kpis.averageCartValue).toBe(92.5); // 185 / 2
      expect(kpis.totalUnpurchasedItems).toBe(4); // (2+1) + (1) = 4 items
    });

    it('should sort abandoned carts properly', () => {
      const abandoned = filterAbandonedCarts(mockRawCarts as any, 24, referenceNow);

      const sortedByPrice = sortAbandonedCarts(abandoned, 'total_price_desc');
      expect(sortedByPrice[0].id).toBe('cart-1'); // $165 vs $20

      const sortedByItems = sortAbandonedCarts(abandoned, 'items_count_desc');
      expect(sortedByItems[0].id).toBe('cart-1'); // 3 items vs 1 item
    });
  });

  describe('Server Action RBAC Guard (getAbandonedCartReportData)', () => {
    it('should fail if caller is unauthenticated', async () => {
      mockAuth.mockResolvedValueOnce(null);
      const result = await getAbandonedCartReportData({});
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/not authorized/i);
    });

    it('should fail if caller is not an admin', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { role: 'user', email: 'user@example.com' },
      });
      const result = await getAbandonedCartReportData({});
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/not authorized/i);
    });
  });
});
