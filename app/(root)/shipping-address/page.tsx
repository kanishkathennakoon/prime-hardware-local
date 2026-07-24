import { auth } from '@/auth';
import { getMyCart } from '@/lib/actions/cart.actions';
import { getUserById } from '@/lib/actions/user.actions';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ShippingAddress } from '@/types';
import ShippingAddressForm from './shipping-address-form';
import CheckoutSteps from '@/components/shared/checkout-steps';

export const metadata: Metadata = {
  title: 'Shipping Address',
};

const ShippingAddressPage = async () => {
  const cart = await getMyCart();

  if (!cart || cart.items.length === 0) redirect('/cart');

  const session = await auth();

  const userId = session?.user?.id;

  if (!userId) throw new Error('No user ID');

  const user = await getUserById(userId);

  const userAddress = user.address as Partial<ShippingAddress> | null;

  const defaultShippingAddress: ShippingAddress = {
    fullName: userAddress?.fullName || user.name || '',
    streetAddress: userAddress?.streetAddress || '',
    city: userAddress?.city || '',
    postalCode: userAddress?.postalCode || '',
    country: userAddress?.country || '',
    lat: userAddress?.lat,
    lng: userAddress?.lng,
  };

  return (
    <>
      <CheckoutSteps current={1} />
      <ShippingAddressForm address={defaultShippingAddress} />
    </>
  );
};

export default ShippingAddressPage;
