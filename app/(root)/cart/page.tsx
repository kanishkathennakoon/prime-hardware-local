import CartTable from './cart-table';
import { getMyCart } from '@/lib/actions/cart.actions';
import { auth } from '@/auth';

export const metadata = {
  title: 'Shopping Cart',
};

const CartPage = async () => {
  const cart = await getMyCart();
  const session = await auth();
  const isAdmin = session?.user?.role === 'admin';

  return (
    <>
      <CartTable cart={cart} isAdmin={isAdmin} />
    </>
  );
};

export default CartPage;
