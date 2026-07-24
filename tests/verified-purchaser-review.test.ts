import { createUpdateReview, getCanUserReview } from '@/lib/actions/review.actions';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

describe('Verified Purchaser Review Guard - Feature F-20', () => {
  it('should reject review creation when user has not purchased or paid for the product', async () => {
    // Find a user who has no paid order for a product (e.g. admin@example.com)
    const nonPurchaserUser = await prisma.user.findFirst({
      where: { email: 'admin@example.com' },
    });

    const sampleProduct = await prisma.product.findFirst({
      where: { slug: 'rhino-premier-roofing-sheet' },
    });

    if (!nonPurchaserUser || !sampleProduct) return;

    (auth as jest.Mock).mockResolvedValue({
      user: { id: nonPurchaserUser.id, email: nonPurchaserUser.email },
    });

    const res = await createUpdateReview({
      title: 'Unverified Review Attempt',
      description: 'Attempting to review without buying.',
      rating: 5,
      productId: sampleProduct.id,
      userId: nonPurchaserUser.id,
    });

    expect(res.success).toBe(false);
    expect(res.message).toMatch(/only verified purchasers/i);
  });

  it('should allow review creation when user has paid order for the product', async () => {
    // Find a user who has paid order for product (e.g. user@example.com)
    const purchaserUser = await prisma.user.findFirst({
      where: { email: 'user@example.com' },
    });

    const purchasedProduct = await prisma.product.findFirst({
      where: { slug: 'rhino-premier-roofing-sheet' },
    });

    if (!purchaserUser || !purchasedProduct) return;

    (auth as jest.Mock).mockResolvedValue({
      user: { id: purchaserUser.id, email: purchaserUser.email },
    });

    const res = await createUpdateReview({
      title: 'Authentic Verified Purchaser Review',
      description: 'Excellent product quality, highly satisfied!',
      rating: 5,
      productId: purchasedProduct.id,
      userId: purchaserUser.id,
    });

    expect(res.success).toBe(true);
  });

  it('should return boolean purchaser status correctly in getCanUserReview', async () => {
    const purchaserUser = await prisma.user.findFirst({
      where: { email: 'user@example.com' },
    });

    const purchasedProduct = await prisma.product.findFirst({
      where: { slug: 'rhino-premier-roofing-sheet' },
    });

    if (!purchaserUser || !purchasedProduct) return;

    (auth as jest.Mock).mockResolvedValue({
      user: { id: purchaserUser.id, email: purchaserUser.email },
    });

    const canReview = await getCanUserReview({ productId: purchasedProduct.id });
    expect(canReview).toBe(true);
  });
});
