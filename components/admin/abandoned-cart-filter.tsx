'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, RotateCcw } from 'lucide-react';

interface AbandonedCartFilterProps {
  initialThresholdHours?: number;
  initialSortBy?: string;
}

export default function AbandonedCartFilter({
  initialThresholdHours = 24,
  initialSortBy = 'created_at_desc',
}: AbandonedCartFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [thresholdHours, setThresholdHours] = useState<string>(
    String(initialThresholdHours)
  );
  const [sortBy, setSortBy] = useState<string>(initialSortBy);

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (thresholdHours && thresholdHours !== '24') {
        params.set('thresholdHours', thresholdHours);
      } else {
        params.delete('thresholdHours');
      }

      if (sortBy && sortBy !== 'created_at_desc') {
        params.set('sortBy', sortBy);
      } else {
        params.delete('sortBy');
      }

      router.push(`/admin/reports/abandoned-carts?${params.toString()}`);
    });
  };

  const handleResetFilter = () => {
    setThresholdHours('24');
    setSortBy('created_at_desc');
    startTransition(() => {
      router.push('/admin/reports/abandoned-carts');
    });
  };

  return (
    <form
      onSubmit={handleApplyFilter}
      className='no-print flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4 shadow-sm mb-6'
    >
      <div className='flex-1 min-w-[200px] space-y-1.5'>
        <Label htmlFor='thresholdHours' className='text-xs font-semibold'>
          Inactivity Threshold Period
        </Label>
        <Select value={thresholdHours} onValueChange={setThresholdHours}>
          <SelectTrigger id='thresholdHours'>
            <SelectValue placeholder='Select threshold' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='12'>Older than 12 Hours</SelectItem>
            <SelectItem value='24'>Older than 24 Hours (1 Day)</SelectItem>
            <SelectItem value='48'>Older than 48 Hours (2 Days)</SelectItem>
            <SelectItem value='72'>Older than 72 Hours (3 Days)</SelectItem>
            <SelectItem value='168'>Older than 7 Days (1 Week)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='flex-1 min-w-[200px] space-y-1.5'>
        <Label htmlFor='sortBy' className='text-xs font-semibold'>
          Sort Carts By
        </Label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger id='sortBy'>
            <SelectValue placeholder='Select sorting' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='created_at_desc'>Most Recently Abandoned</SelectItem>
            <SelectItem value='created_at_asc'>Oldest Abandoned</SelectItem>
            <SelectItem value='total_price_desc'>Highest Lost Value</SelectItem>
            <SelectItem value='items_count_desc'>Most Items Count</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='flex items-center gap-2'>
        <Button type='submit' size='sm' disabled={isPending}>
          <Filter className='h-4 w-4 mr-1.5' /> Filter
        </Button>

        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={handleResetFilter}
          disabled={isPending}
        >
          <RotateCcw className='h-4 w-4 mr-1.5' /> Reset
        </Button>
      </div>
    </form>
  );
}
