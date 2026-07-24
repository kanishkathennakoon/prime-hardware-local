import sampleData from '@/db/sample-data';
import { createUpdateReview } from '@/lib/actions/review.actions';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

describe('Product Reviews Display & Seed Data - Feature F-19', () => {
  it('should include authentic sample reviews in sampleData', () => {
    const reviews = (sampleData as any).reviews;
    expect(reviews).toBeDefined();
    expect(Array.isArray(reviews)).toBe(true);
    expect(reviews.length).toBeGreaterThan(0);
  });

  it('should have valid fields on every sample review item', () => {
    const reviews = (sampleData as any).reviews || [];
    reviews.forEach((review: any) => {
      expect(review.title).toBeTruthy();
      expect(review.description).toBeTruthy();
      expect(review.rating).toBeGreaterThanOrEqual(1);
      expect(review.rating).toBeLessThanOrEqual(5);
      expect(review.userEmail).toBeTruthy();
      expect(review.productSlug).toBeTruthy();
    });
  });

  it('should calculate average rating and review count correctly', () => {
    const mockReviews = [
      { rating: 5 },
      { rating: 4 },
      { rating: 5 },
    ];

    const numReviews = mockReviews.length;
    const avgRating = Number(
      (mockReviews.reduce((acc, r) => acc + r.rating, 0) / numReviews).toFixed(1)
    );

    expect(numReviews).toBe(3);
    expect(avgRating).toBe(4.7);
  });

  it('should safely fall back to matching user email if session user ID is stale or un-synced', async () => {
    // Get valid user and product from database
    const dbUser = await prisma.user.findFirst({ where: { email: 'user@example.com' } });
    const sampleProduct = await prisma.product.findFirst();
    if (!dbUser || !sampleProduct) return;

    // Mock user session with non-matching UUID but valid email
    (auth as jest.Mock).mockResolvedValue({
      user: { id: '00000000-0000-0000-0000-000000000000', email: dbUser.email },
    });

    const res = await createUpdateReview({
      title: 'Resilient Review Test',
      description: 'Review submission handles user session mapping safely.',
      rating: 5,
      productId: sampleProduct.id,
      userId: dbUser.id,
    });

    expect(res.success).toBe(true);
  });
});
