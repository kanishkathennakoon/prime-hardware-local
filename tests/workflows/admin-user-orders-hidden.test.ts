import React from 'react';
import MainNav from '@/app/user/main-nav';
import UserLayout from '@/app/user/layout';
import OrdersPage from '@/app/user/orders/page';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/user/profile'),
  redirect: jest.fn(),
}));

jest.mock('@/lib/actions/order.actions', () => ({
  getMyOrders: jest.fn().mockResolvedValue({
    data: [],
    totalPages: 1,
  }),
}));

jest.mock('@/components/shared/header/menu', () => jest.fn().mockReturnValue(React.createElement('div', null, 'MockMenu')));

describe('Hide User Orders Tab for Admin Users - Feature F-25', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('MainNav Component', () => {
    function containsOrdersLink(node: any): boolean {
      if (!node) return false;
      if (typeof node === 'object' && node.props) {
        if (node.props.href === '/user/orders') return true;
        if (Array.isArray(node.props.children)) {
          return node.props.children.some(containsOrdersLink);
        }
        return containsOrdersLink(node.props.children);
      }
      if (Array.isArray(node)) {
        return node.some(containsOrdersLink);
      }
      return false;
    }

    it('should hide Orders link when isAdmin is true', () => {
      const jsx = MainNav({ isAdmin: true });
      expect(containsOrdersLink(jsx)).toBe(false);
    });

    it('should show Orders link when isAdmin is false', () => {
      const jsx = MainNav({ isAdmin: false });
      expect(containsOrdersLink(jsx)).toBe(true);
    });
  });

  describe('UserLayout Component', () => {
    it('should pass isAdmin=true to MainNav for admin user session', async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: 'admin-1', role: 'admin', email: 'admin@example.com' },
      });

      const jsx = await UserLayout({ children: React.createElement('div', null, 'Child') });
      
      function findMainNavProps(node: any): any {
        if (!node) return null;
        if (typeof node === 'object' && node.props) {
          if (node.type === MainNav) return node.props;
          if (Array.isArray(node.props.children)) {
            for (const child of node.props.children) {
              const found = findMainNavProps(child);
              if (found) return found;
            }
          }
          return findMainNavProps(node.props.children);
        }
        if (Array.isArray(node)) {
          for (const child of node) {
            const found = findMainNavProps(child);
            if (found) return found;
          }
        }
        return null;
      }

      const props = findMainNavProps(jsx);
      expect(props).toBeDefined();
      expect(props.isAdmin).toBe(true);
    });
  });

  describe('OrdersPage Route Guard', () => {
    it('should redirect admin users to /admin/overview when accessing /user/orders', async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { id: 'admin-1', role: 'admin', email: 'admin@example.com' },
      });

      await OrdersPage({ searchParams: Promise.resolve({ page: '1' }) });

      expect(redirect).toHaveBeenCalledWith('/admin/overview');
    });
  });
});
