'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from '@/lib/actions/user.actions';
import { updateProfileSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface ProfileFormProps {
  initialData?: {
    name?: string;
    email?: string;
    streetAddress?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
}

const ProfileForm = ({ initialData }: ProfileFormProps) => {
  const { data: session, update } = useSession();

  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialData?.name || session?.user?.name || '',
      email: initialData?.email || session?.user?.email || '',
      streetAddress: initialData?.streetAddress || '',
      city: initialData?.city || '',
      postalCode: initialData?.postalCode || '',
      country: initialData?.country || '',
    },
  });

  const { toast } = useToast();

  const onSubmit = async (values: z.infer<typeof updateProfileSchema>) => {
    const res = await updateProfile(values);

    if (!res.success) {
      return toast({
        variant: 'destructive',
        description: res.message,
      });
    }

    const newSession = {
      ...session,
      user: {
        ...session?.user,
        name: values.name,
      },
    };

    await update(newSession);

    toast({
      description: res.message,
    });
  };

  return (
    <Form {...form}>
      <form
        className='flex flex-col gap-5'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className='flex flex-col gap-4'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    disabled
                    placeholder='Email'
                    className='input-field'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Full Name'
                    className='input-field'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='pt-2 border-t border-border'>
            <h3 className='text-sm font-semibold mb-3 text-muted-foreground'>Shipping / Delivery Address</h3>
            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='streetAddress'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='123 Main Street, Suite A'
                        className='input-field'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='city'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='City / Town'
                          className='input-field'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='postalCode'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Postal Code'
                          className='input-field'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='country'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Country'
                        className='input-field'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <Button
          type='submit'
          size='lg'
          className='button col-span-2 w-full mt-2'
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Submitting...' : 'Update Profile'}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
