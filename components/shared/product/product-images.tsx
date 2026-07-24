'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const ProductImages = ({ images }: { images: string[] }) => {
  const [current, setCurrent] = useState(0);

  return (
    <div className='space-y-4 w-full'>
      {/* Main Feature Image Container with Fixed Aspect Ratio */}
      <div className='relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted/10 flex items-center justify-center'>
        <Image
          src={images[current]}
          alt='product image'
          fill
          sizes='(max-width: 768px) 100vw, 50vw'
          className='object-contain object-center p-4 transition-all duration-200'
          priority={true}
        />
      </div>

      {/* Thumbnail Selector Row with Fixed Dimensions */}
      <div className='flex flex-wrap gap-2'>
        {images.map((image, index) => (
          <button
            type='button'
            key={image}
            onClick={() => setCurrent(index)}
            className={cn(
              'relative aspect-square h-20 w-20 overflow-hidden rounded-md border cursor-pointer transition-all focus:outline-none',
              current === index
                ? 'border-primary ring-2 ring-primary/30 opacity-100'
                : 'border-border opacity-60 hover:opacity-100 hover:border-muted-foreground'
            )}
            title={`View image ${index + 1}`}
          >
            <Image
              src={image}
              alt={`product thumbnail ${index + 1}`}
              fill
              className='object-cover object-center'
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductImages;
