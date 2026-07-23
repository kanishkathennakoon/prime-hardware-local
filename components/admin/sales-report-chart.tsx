'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { MonthlySalesData } from '@/lib/utils/sales-report-helpers';
import { formatCurrency } from '@/lib/utils';

interface SalesReportChartProps {
  data: MonthlySalesData[];
}

export default function SalesReportChart({ data }: SalesReportChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className='flex h-[350px] w-full items-center justify-center rounded-lg border border-dashed p-8 text-muted-foreground'>
        No sales data available for the selected period.
      </div>
    );
  }

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray='3 3' className='stroke-muted/30' vertical={false} />
        <XAxis
          dataKey='month'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            name === 'totalSales' ? formatCurrency(value) : value,
            name === 'totalSales' ? 'Total Revenue' : 'Orders',
          ]}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
            borderRadius: '0.5rem',
            color: 'hsl(var(--foreground))',
          }}
        />
        <Bar
          dataKey='totalSales'
          name='Total Revenue'
          fill='hsl(var(--primary))'
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
