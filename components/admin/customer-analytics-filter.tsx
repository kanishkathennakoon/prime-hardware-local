'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
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

interface CustomerAnalyticsFilterProps {
  initialMinSpend?: number;
  initialMinOrders?: number;
  initialSortBy?: string;
}

export default function CustomerAnalyticsFilter({
  initialMinSpend,
  initialMinOrders,
  initialSortBy = 'lifetime_spend_desc',
}: CustomerAnalyticsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [minSpend, setMinSpend] = useState<string>(
    initialMinSpend !== undefined ? String(initialMinSpend) : ''
  );
  const [minOrders, setMinOrders] = useState<string>(
    initialMinOrders !== undefined ? String(initialMinOrders) : ''
  );
  const [sortBy, setSortBy] = useState<string>(initialSortBy);

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (minSpend && Number(minSpend) > 0) {
        params.set('minSpend', minSpend);
      } else {
        params.delete('minSpend');
      }

      if (minOrders && Number(minOrders) > 0) {
        params.set('minOrders', minOrders);
      } else {
        params.delete('minOrders');
      }

      if (sortBy && sortBy !== 'lifetime_spend_desc') {
        params.set('sortBy', sortBy);
      } else {
        params.delete('sortBy');
      }

      router.push(`/admin/reports/customer-analytics?${params.toString()}`);
    });
  };

  const handleResetFilter = () => {
    setMinSpend('');
    setMinOrders('');
    setSortBy('lifetime_spend_desc');
    startTransition(() => {
      router.push('/admin/reports/customer-analytics');
    });
  };

  return (
    <form
      onSubmit={handleApplyFilter}
      className='no-print flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4 shadow-sm mb-6'
    >
      <div className='flex-1 min-w-[180px] space-y-1.5'>
        <Label htmlFor='minSpend' className='text-xs font-semibold'>
          Min Lifetime Spend (Rs.)
        </Label>

        <Input
          id='minSpend'
          type='number'
          placeholder='e.g. 100'
          min='0'
          step='any'
          value={minSpend}
          onChange={(e) => setMinSpend(e.target.value)}
        />
      </div>

      <div className='flex-1 min-w-[150px] space-y-1.5'>
        <Label htmlFor='minOrders' className='text-xs font-semibold'>
          Min Orders Placed
        </Label>
        <Input
          id='minOrders'
          type='number'
          placeholder='e.g. 2'
          min='0'
          step='1'
          value={minOrders}
          onChange={(e) => setMinOrders(e.target.value)}
        />
      </div>

      <div className='flex-1 min-w-[200px] space-y-1.5'>
        <Label htmlFor='sortBy' className='text-xs font-semibold'>
          Sort Ranking By
        </Label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger id='sortBy'>
            <SelectValue placeholder='Select sorting' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='lifetime_spend_desc'>Highest Lifetime Spend</SelectItem>
            <SelectItem value='order_count_desc'>Most Orders Placed</SelectItem>
            <SelectItem value='last_order_desc'>Most Recent Order</SelectItem>
            <SelectItem value='name_asc'>Customer Name (A-Z)</SelectItem>
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
