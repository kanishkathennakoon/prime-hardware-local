'use client';

import { useEffect, useState } from 'react';
import { Review } from '@/types';
import Link from 'next/link';
import ReviewForm from './review-form';
import { getReviews, getCanUserReview } from '@/lib/actions/review.actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, User, CheckCircle2 } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import Rating from '@/components/shared/product/rating';

const ReviewList = ({
  userId,
  productId,
  productSlug,
}: {
  userId: string;
  productId: string;
  productSlug: string;
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canUserReview, setCanUserReview] = useState<boolean>(false);

  useEffect(() => {
    const loadReviews = async () => {
      const res = await getReviews({ productId });
      setReviews(res.data);
      if (userId) {
        const canReview = await getCanUserReview({ productId });
        setCanUserReview(canReview);
      }
    };

    loadReviews();
  }, [productId, userId]);

  // Reload reviews after created or updated
  const reload = async () => {
    const res = await getReviews({ productId });
    setReviews([...res.data]);
    if (userId) {
      const canReview = await getCanUserReview({ productId });
      setCanUserReview(canReview);
    }
  };

  return (
    <div className='space-y-4'>
      {reviews.length === 0 && <div>No reviews yet</div>}
      {userId ? (
        canUserReview ? (
          <ReviewForm
            userId={userId}
            productId={productId}
            onReviewSubmitted={reload}
          />
        ) : (
          <div className='rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground'>
            Only verified purchasers who have bought and paid for this item can leave a review.
          </div>
        )
      ) : (
        <div>
          Please
          <Link
            className='text-blue-700 px-2 font-medium hover:underline'
            href={`/sign-in?callbackUrl=/product/${productSlug}`}
          >
            sign in
          </Link>
          to write a review
        </div>
      )}
      <div className='flex flex-col gap-3'>
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className='flex-between items-center'>
                <CardTitle>{review.title}</CardTitle>
                <div className='inline-flex items-center text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 font-medium'>
                  <CheckCircle2 className='mr-1 h-3 w-3 text-green-600' />
                  Verified Purchase
                </div>
              </div>
              <CardDescription>{review.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
                <Rating value={review.rating} />
                <div className='flex items-center'>
                  <User className='mr-1 h-3 w-3' />
                  {review.user ? review.user.name : 'User'}
                </div>
                <div className='flex items-center'>
                  <Calendar className='mr-1 h-3 w-3' />
                  {formatDateTime(review.createdAt).dateTime}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
