import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import ProductPrice from './product-price';
import { Product } from '@/types';
import Rating from './rating';

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Card className='w-full max-w-sm overflow-hidden flex flex-col justify-between h-full'>
      <CardHeader className='p-0 items-center overflow-hidden'>
        <Link href={`/product/${product.slug}`} className='block w-full relative aspect-square overflow-hidden'>
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            className='object-cover object-center w-full h-full transition-transform duration-300 hover:scale-105'
            priority={true}
          />
        </Link>
      </CardHeader>
      <CardContent className='p-4 grid gap-4 flex-1 justify-between'>
        <div className='space-y-1.5'>
          <div className='text-xs text-muted-foreground'>{product.brand}</div>
          <Link href={`/product/${product.slug}`}>
            <h2 className='text-sm font-medium line-clamp-2 hover:text-primary transition-colors'>
              {product.name}
            </h2>
          </Link>
        </div>
        <div className='flex-between gap-4 pt-2 border-t border-border/50'>
          <Rating value={Number(product.rating)} />
          {product.stock > 0 ? (
            <ProductPrice value={Number(product.price)} />
          ) : (
            <p className='text-destructive font-medium text-sm'>Out Of Stock</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
