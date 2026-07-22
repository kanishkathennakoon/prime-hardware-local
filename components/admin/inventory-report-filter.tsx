'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InventoryReportFilterProps {
  initialThreshold?: number;
  initialCategory?: string;
  initialSortBy?: string;
  categories?: string[];
}

export default function InventoryReportFilter({
  initialThreshold = 10,
  initialCategory = 'all',
  initialSortBy = 'stock_asc',
  categories = [],
}: InventoryReportFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [threshold, setThreshold] = useState<number | string>(initialThreshold);
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSortBy);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (threshold !== undefined && threshold !== '') {
      params.set('threshold', threshold.toString());
    } else {
      params.delete('threshold');
    }

    if (category && category !== 'all') {
      params.set('category', category);
    } else {
      params.delete('category');
    }

    if (sortBy && sortBy !== 'stock_asc') {
      params.set('sortBy', sortBy);
    } else {
      params.delete('sortBy');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => {
    setThreshold(10);
    setCategory('all');
    setSortBy('stock_asc');
    router.push(pathname);
  };

  return (
    <div className='rounded-lg border bg-card p-4 shadow-sm'>
      <form onSubmit={handleFilter} className='flex flex-col gap-4 sm:flex-row sm:items-end'>
        <div className='w-full sm:w-40 space-y-1.5'>
          <Label htmlFor='threshold'>Low-Stock Threshold</Label>
          <Input
            id='threshold'
            type='number'
            min='0'
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            placeholder='10'
          />
        </div>

        <div className='flex-1 space-y-1.5'>
          <Label htmlFor='category'>Category</Label>
          <select
            id='category'
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <option value='all'>All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className='flex-1 space-y-1.5'>
          <Label htmlFor='sortBy'>Sort By</Label>
          <select
            id='sortBy'
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <option value='stock_asc'>Stock: Low to High</option>
            <option value='stock_desc'>Stock: High to Low</option>
            <option value='name_asc'>Product Name: A-Z</option>
          </select>
        </div>

        <div className='flex gap-2'>
          <Button type='submit' variant='default'>
            Apply Filter
          </Button>
          <Button type='button' variant='outline' onClick={handleClear}>
            Clear
          </Button>
        </div>
      </form>
    </div>
  );
}
