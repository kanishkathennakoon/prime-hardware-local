import { Metadata } from 'next';
import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';
import ProfileForm from './profile-form';
import { getUserById } from '@/lib/actions/user.actions';

export const metadata: Metadata = {
  title: 'Customer Profile',
};

const Profile = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  let user = null;
  if (userId) {
    user = await getUserById(userId);
  }

  const userAddress = user?.address as {
    streetAddress?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  } | null;

  return (
    <SessionProvider session={session}>
      <div className='max-w-md mx-auto space-y-4'>
        <h2 className='h2-bold'>Profile</h2>
        <ProfileForm
          isAdmin={session?.user?.role === 'admin'}
          initialData={{
            name: user?.name || session?.user?.name || '',
            email: user?.email || session?.user?.email || '',
            streetAddress: userAddress?.streetAddress || '',
            city: userAddress?.city || '',
            postalCode: userAddress?.postalCode || '',
            country: userAddress?.country || '',
          }}
        />
      </div>
    </SessionProvider>
  );
};

export default Profile;
