import React from 'react';
import Profile from '@/app/user/profile/page';
import { auth } from '@/auth';
import { getUserById } from '@/lib/actions/user.actions';
import ProfileForm from '@/app/user/profile/profile-form';

jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/actions/user.actions', () => ({
  getUserById: jest.fn().mockResolvedValue({
    name: 'Test User',
    email: 'test@example.com',
    address: { streetAddress: '123 Main St', city: 'Colombo', postalCode: '00100', country: 'Sri Lanka' },
  }),
}));

jest.mock('@/app/user/profile/profile-form', () => jest.fn().mockReturnValue(React.createElement('div', null, 'MockProfileForm')));

describe('Hide Address Fields in User Profile for Admin Users - Feature F-24', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  function findProfileFormProps(node: any): any {
    if (!node) return null;
    if (typeof node === 'object' && node.props) {
      if (node.type === ProfileForm) return node.props;
      if (Array.isArray(node.props.children)) {
        for (const child of node.props.children) {
          const found = findProfileFormProps(child);
          if (found) return found;
        }
      }
      return findProfileFormProps(node.props.children);
    }
    if (Array.isArray(node)) {
      for (const child of node) {
        const found = findProfileFormProps(child);
        if (found) return found;
      }
    }
    return null;
  }

  it('should pass isAdmin=true to ProfileForm for admin users', async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { id: 'admin-1', role: 'admin', email: 'admin@example.com' },
    });

    const jsx = await Profile();
    const props = findProfileFormProps(jsx);

    expect(props).not.toBeNull();
    expect(props.isAdmin).toBe(true);
  });

  it('should pass isAdmin=false to ProfileForm for non-admin users', async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { id: 'user-1', role: 'user', email: 'user@example.com' },
    });

    const jsx = await Profile();
    const props = findProfileFormProps(jsx);

    expect(props).not.toBeNull();
    expect(props.isAdmin).toBe(false);
  });
});
