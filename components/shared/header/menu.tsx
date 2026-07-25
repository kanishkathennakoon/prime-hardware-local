import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import ModeToggle from './mode-toggle';
import Link from 'next/link';
import { EllipsisVertical, ShoppingCart } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import UserButton from './user-button';
import { getMyCart } from '@/lib/actions/cart.actions';
import { CartItem } from '@/types';
import { Badge } from '@/components/ui/badge';

const Menu = async () => {
  const session = await auth();
  const isAdmin = session?.user?.role === 'admin';
  const cart = await getMyCart();
  const totalCartQty =
    (cart?.items as CartItem[])?.reduce((acc, item) => acc + item.qty, 0) || 0;

  return (
    <div className='flex justify-end gap-3'>
      <nav className='hidden md:flex w-full max-w-xs gap-1'>
        <ModeToggle />
        {!isAdmin && (
          <Button asChild variant='ghost'>
            <Link href='/cart' className='relative flex items-center gap-1'>
              <ShoppingCart /> Cart
              {totalCartQty > 0 && (
                <Badge
                  variant='destructive'
                  className='ml-1 px-1.5 py-0.5 text-xs rounded-full'
                >
                  {totalCartQty}
                </Badge>
              )}
            </Link>
          </Button>
        )}
        <UserButton />
      </nav>
      <nav className='md:hidden'>
        <Sheet>
          <SheetTrigger className='align-middle'>
            <EllipsisVertical />
          </SheetTrigger>
          <SheetContent className='flex flex-col items-start'>
            <SheetTitle>Menu</SheetTitle>
            <ModeToggle />
            {!isAdmin && (
              <Button asChild variant='ghost'>
                <Link href='/cart' className='relative flex items-center gap-1'>
                  <ShoppingCart /> Cart
                  {totalCartQty > 0 && (
                    <Badge
                      variant='destructive'
                      className='ml-1 px-1.5 py-0.5 text-xs rounded-full'
                    >
                      {totalCartQty}
                    </Badge>
                  )}
                </Link>
              </Button>
            )}
            <UserButton />
            <SheetDescription></SheetDescription>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
