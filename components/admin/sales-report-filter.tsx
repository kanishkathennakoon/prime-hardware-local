'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SalesReportFilterProps {
  initialStartDate?: string;
  initialEndDate?: string;
}

export default function SalesReportFilter({
  initialStartDate = '',
  initialEndDate = '',
}: SalesReportFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [error, setError] = useState<string | null>(null);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date.');
      return;
    }
    setError(null);

    const params = new URLSearchParams(searchParams.toString());
    if (startDate) {
      params.set('startDate', startDate);
    } else {
      params.delete('startDate');
    }

    if (endDate) {
      params.set('endDate', endDate);
    } else {
      params.delete('endDate');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setError(null);
    router.push(pathname);
  };

  return (
    <div className='rounded-lg border bg-card p-4 shadow-sm'>
      <form onSubmit={handleFilter} className='flex flex-col gap-4 sm:flex-row sm:items-end'>
        <div className='flex-1 space-y-1.5'>
          <Label htmlFor='startDate'>Start Date</Label>
          <Input
            id='startDate'
            type='date'
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className='flex-1 space-y-1.5'>
          <Label htmlFor='endDate'>End Date</Label>
          <Input
            id='endDate'
            type='date'
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
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
      {error && <p className='mt-2 text-sm text-destructive'>{error}</p>}
    </div>
  );
}
