import React from 'react';
import { addItemToCart } from '@/lib/actions/cart.actions';
import { createOrder } from '@/lib/actions/order.actions';
import Menu from '@/components/shared/header/menu';
import { auth } from '@/auth';

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue({ value: 'sample-session-cart-id' }),
  }),
}));

jest.mock('@/lib/actions/cart.actions', () => {
  const original = jest.requireActual('@/lib/actions/cart.actions');
  return {
    ...original,
    getMyCart: jest.fn().mockResolvedValue({
      id: 'cart-1',
      items: [{ productId: 'p1', name: 'Hammer', slug: 'hammer', price: '1500', qty: 1, image: '/img.jpg' }],
      itemsPrice: '1500',
      totalPrice: '1735',
      shippingPrice: '0',
      taxPrice: '225',
    }),
  };
});

describe('Admin Purchase Restrictions - Feature F-22', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addItemToCart Action', () => {
    it('should reject addItemToCart when caller is an admin user', async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: 'admin-1', role: 'admin', email: 'admin@example.com' },
      });

      const res = await addItemToCart({
        productId: 'prod-1',
        name: 'Test Tool',
        slug: 'test-tool',
        price: '1000',
        qty: 1,
        image: '/test.jpg',
      });

      expect(res.success).toBe(false);
      expect(res.message).toMatch(/admin/i);
    });
  });

  describe('createOrder Action', () => {
    it('should reject createOrder when caller is an admin user', async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: 'admin-1', role: 'admin', email: 'admin@example.com' },
      });

      const res = await createOrder();

      expect(res.success).toBe(false);
      expect(res.message).toMatch(/admin/i);
    });
  });

  describe('Header Menu Component', () => {
    function containsCartLink(node: any): boolean {
      if (!node) return false;
      if (typeof node === 'object' && node.props) {
        if (node.props.href === '/cart') return true;
        if (Array.isArray(node.props.children)) {
          return node.props.children.some(containsCartLink);
        }
        return containsCartLink(node.props.children);
      }
      if (Array.isArray(node)) {
        return node.some(containsCartLink);
      }
      return false;
    }

    it('should hide cart link for admin users', async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: 'admin-1', role: 'admin', email: 'admin@example.com' },
      });

      const jsx = await Menu();
      expect(containsCartLink(jsx)).toBe(false);
    });

    it('should show cart link for non-admin users', async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: 'user-1', role: 'user', email: 'user@example.com' },
      });

      const jsx = await Menu();
      expect(containsCartLink(jsx)).toBe(true);
    });
  });
});
