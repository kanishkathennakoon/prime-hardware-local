'use server';

import { z } from 'zod';
import { insertReviewSchema } from '../validators';
import { formatError } from '../utils';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { revalidatePath } from 'next/cache';

const isValidUuid = (val?: string) =>
  typeof val === 'string' &&
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    val
  );

// Create & Update Reviews
export async function createUpdateReview(
  data: z.infer<typeof insertReviewSchema>
) {
  try {
    const session = await auth();
    if (!session || !session.user) throw new Error('User is not authenticated');

    // Find active user record by ID or Email (handles stale session cookies gracefully)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(isValidUuid(session.user.id) ? [{ id: session.user.id as string }] : []),
          ...(session.user.email ? [{ email: session.user.email as string }] : []),
        ],
      },
    });

    if (!user) {
      throw new Error('User account not found. Please sign out and sign in again.');
    }

    // Validate and store the review using active user.id
    const review = insertReviewSchema.parse({
      ...data,
      userId: user.id,
    });

    // Get product that is being reviewed
    const product = await prisma.product.findFirst({
      where: { id: review.productId },
    });

    if (!product) throw new Error('Product not found');

    // Check if user already reviewed
    const reviewExists = await prisma.review.findFirst({
      where: {
        productId: review.productId,
        userId: review.userId,
      },
    });

    await prisma.$transaction(async (tx) => {
      if (reviewExists) {
        // Update review
        await tx.review.update({
          where: { id: reviewExists.id },
          data: {
            title: review.title,
            description: review.description,
            rating: review.rating,
          },
        });
      } else {
        // Create review
        await tx.review.create({ data: review });
      }

      // Get avg rating
      const averageRating = await tx.review.aggregate({
        _avg: { rating: true },
        where: { productId: review.productId },
      });

      // Get number of reviews
      const numReviews = await tx.review.count({
        where: { productId: review.productId },
      });

      // Update the rating and numReviews in product table
      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: averageRating._avg.rating || 0,
          numReviews,
        },
      });
    });

    try {
      revalidatePath(`/product/${product.slug}`);
    } catch (err) {
      console.warn('Path revalidation skipped:', err instanceof Error ? err.message : err);
    }

    return {
      success: true,
      message: 'Review Updated Successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get all reviews for a product
export async function getReviews({ productId }: { productId: string }) {
  const data = await prisma.review.findMany({
    where: {
      productId: productId,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return { data };
}

// Get a review written by the current user
export async function getReviewByProductId({
  productId,
}: {
  productId: string;
}) {
  const session = await auth();

  if (!session || !session.user) return null;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(isValidUuid(session.user.id) ? [{ id: session.user.id as string }] : []),
        ...(session.user.email ? [{ email: session.user.email as string }] : []),
      ],
    },
  });

  if (!user) return null;

  return await prisma.review.findFirst({
    where: {
      productId,
      userId: user.id,
    },
  });
}
