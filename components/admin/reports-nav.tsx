'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BarChart3, Boxes } from 'lucide-react';

export const reportNavLinks = [
  {
    title: 'Sales Report',
    href: '/admin/reports/sales',
    icon: BarChart3,
  },
  {
    title: 'Inventory Report',
    href: '/admin/reports/inventory',
    icon: Boxes,
  },
];

export default function ReportsNav() {
  const pathname = usePathname();

  return (
    <div className='flex border-b border-border mb-6 space-x-2'>
      {reportNavLinks.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
              isActive
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            )}
          >
            <Icon className='h-4 w-4' />
            {item.title}
          </Link>
        );
      })}
    </div>
  );
}
