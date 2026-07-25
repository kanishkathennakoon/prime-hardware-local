import { signOutUser } from '@/lib/actions/user.actions';
import { signOut } from '@/auth';

jest.mock('@/auth', () => ({
  signOut: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/actions/cart.actions', () => ({
  getMyCart: jest.fn().mockResolvedValue(null),
}));

describe('Sign Out Redirect URL - Feature F-23', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call signOut with redirectTo set to /sign-in', async () => {
    await signOutUser();

    expect(signOut).toHaveBeenCalledWith({ redirectTo: '/sign-in' });
  });
});
