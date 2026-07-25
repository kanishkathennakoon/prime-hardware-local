'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import React from 'react';

const links = [
  {
    title: 'Profile',
    href: '/user/profile',
  },
  {
    title: 'Orders',
    href: '/user/orders',
  },
];

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {
  isAdmin?: boolean;
}

const MainNav = ({
  className,
  isAdmin,
  ...props
}: MainNavProps) => {
  const pathname = usePathname();
  const filteredLinks = isAdmin
    ? links.filter((item) => item.href !== '/user/orders')
    : links;

  return (
    <nav
      className={cn('flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      {filteredLinks.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname.includes(item.href) ? '' : 'text-muted-foreground'
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
};

export default MainNav;
