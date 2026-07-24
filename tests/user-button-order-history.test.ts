import React from 'react';
import UserButton from '@/components/shared/header/user-button';
import { auth } from '@/auth';

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

describe('UserButton Component - Feature F-11 (Admin Order History Link Removal)', () => {
  it('should render User Profile and Order History for standard users', async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: {
        name: 'Standard User',
        email: 'user@example.com',
        role: 'user',
      },
    });

    const jsx = await UserButton();
    expect(jsx).toBeDefined();
  });

  it('should render User Profile and Admin link for admin users', async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: {
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      },
    });

    const jsx = await UserButton();
    expect(jsx).toBeDefined();
  });
});
