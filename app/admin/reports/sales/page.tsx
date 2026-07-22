import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getSalesReportData } from '@/lib/actions/report.actions';
import SalesReportChart from '@/components/admin/sales-report-chart';
import SalesReportFilter from '@/components/admin/sales-report-filter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Sales Report - Admin Dashboard',
};

interface SalesReportPageProps {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function SalesReportPage({ searchParams }: SalesReportPageProps) {
  const session = await auth();
  if (!session || session?.user?.role !== 'admin') {
    redirect('/unauthorized');
  }

  const { startDate, endDate } = await searchParams;
  const reportResult = await getSalesReportData({ startDate, endDate });

  const data = reportResult.data || {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    monthlySales: [],
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='h2-bold'>Sales Report</h1>
        <p className='text-muted-foreground'>
          Comprehensive breakdown of sales revenue, order volumes, and average order metrics.
        </p>
      </div>

      <SalesReportFilter initialStartDate={startDate} initialEndDate={endDate} />

      {/* KPI Cards */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatCurrency(data.totalRevenue)}</div>
            <p className='text-xs text-muted-foreground'>
              Aggregated sales across selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Orders</CardTitle>
            <ShoppingBag className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.totalOrders}</div>
            <p className='text-xs text-muted-foreground'>Total completed orders count</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Average Order Value (AOV)</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatCurrency(data.averageOrderValue)}</div>
            <p className='text-xs text-muted-foreground'>Average revenue generated per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesReportChart data={data.monthlySales} />
        </CardContent>
      </Card>

      {/* Monthly Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary Table</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className='text-right'>Orders</TableHead>
                <TableHead className='text-right'>Total Revenue</TableHead>
                <TableHead className='text-right'>Average Order Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.monthlySales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className='text-center text-muted-foreground'>
                    No sales records found for this timeframe.
                  </TableCell>
                </TableRow>
              ) : (
                data.monthlySales.map((row) => {
                  const monthlyAOV = row.orderCount > 0 ? row.totalSales / row.orderCount : 0;
                  return (
                    <TableRow key={row.month}>
                      <TableCell className='font-medium'>{row.month}</TableCell>
                      <TableCell className='text-right'>{row.orderCount}</TableCell>
                      <TableCell className='text-right'>{formatCurrency(row.totalSales)}</TableCell>
                      <TableCell className='text-right'>{formatCurrency(monthlyAOV)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
