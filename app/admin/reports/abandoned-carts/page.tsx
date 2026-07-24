import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAbandonedCartReportData } from '@/lib/actions/report.actions';
import ReportsNav from '@/components/admin/reports-nav';
import AbandonedCartFilter from '@/components/admin/abandoned-cart-filter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { DollarSign, ShoppingCart, TrendingUp, PackageX, AlertCircle, Clock } from 'lucide-react';

export const metadata = {
  title: 'Abandoned Cart Report - Admin Dashboard',
};

interface AbandonedCartsPageProps {
  searchParams: Promise<{
    thresholdHours?: string;
    sortBy?: 'created_at_desc' | 'created_at_asc' | 'total_price_desc' | 'items_count_desc';
  }>;
}

export default async function AbandonedCartsPage({ searchParams }: AbandonedCartsPageProps) {
  const session = await auth();
  if (!session || session?.user?.role !== 'admin') {
    redirect('/unauthorized');
  }

  const { thresholdHours: thresholdHoursParam, sortBy } = await searchParams;
  const thresholdHours = thresholdHoursParam ? parseInt(thresholdHoursParam, 10) : 24;

  const reportResult = await getAbandonedCartReportData({
    thresholdHours,
    sortBy,
  });

  const data = reportResult.data || {
    kpis: {
      totalAbandonedCartsCount: 0,
      totalLostRevenue: 0,
      averageCartValue: 0,
      totalUnpurchasedItems: 0,
      thresholdHours: 24,
    },
    abandonedCarts: [],
    thresholdHours: 24,
  };

  return (
    <div className='space-y-6'>
      <ReportsNav />

      <div>
        <h1 className='h2-bold'>Abandoned Cart Report</h1>
        <p className='text-muted-foreground'>
          Track unconverted shopping cart records older than {data.thresholdHours} hours, analyze lost revenue potential, and monitor unpurchased items.
        </p>
      </div>

      <AbandonedCartFilter
        initialThresholdHours={data.thresholdHours}
        initialSortBy={sortBy}
      />

      {/* KPI Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className={data.kpis.totalAbandonedCartsCount > 0 ? 'border-amber-500/40 bg-amber-500/5' : ''}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Abandoned Carts</CardTitle>
            <ShoppingCart className='h-4 w-4 text-amber-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-amber-600 dark:text-amber-400'>
              {data.kpis.totalAbandonedCartsCount}
            </div>
            <p className='text-xs text-muted-foreground'>
              Carts inactive &gt; {data.thresholdHours} hours
            </p>
          </CardContent>
        </Card>

        <Card className={data.kpis.totalLostRevenue > 0 ? 'border-destructive/40 bg-destructive/5' : ''}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Lost Revenue Potential</CardTitle>
            <DollarSign className='h-4 w-4 text-destructive' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-destructive'>
              {formatCurrency(data.kpis.totalLostRevenue)}
            </div>
            <p className='text-xs text-muted-foreground'>Total unrecovered cart value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Average Cart Value</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatCurrency(data.kpis.averageCartValue)}</div>
            <p className='text-xs text-muted-foreground'>Average revenue per abandoned cart</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Unpurchased Items</CardTitle>
            <PackageX className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.kpis.totalUnpurchasedItems}</div>
            <p className='text-xs text-muted-foreground'>Total items trapped in abandoned carts</p>
          </CardContent>
        </Card>
      </div>

      {/* Abandoned Carts Table */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-amber-600 dark:text-amber-400'>
            <AlertCircle className='h-5 w-5' /> Abandoned Shopping Cart Records
          </CardTitle>
          <p className='text-sm text-muted-foreground'>
            Cart sessions created &gt; {data.thresholdHours} hours ago that were not converted into completed orders.
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer / Account</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead className='text-center'>Inactivity Age</TableHead>
                <TableHead className='text-center'>Cart Created</TableHead>
                <TableHead className='text-center'>Items Count</TableHead>
                <TableHead>Item Breakdown</TableHead>
                <TableHead className='text-right'>Potential Value</TableHead>
                <TableHead className='text-center'>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.abandonedCarts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className='text-center text-muted-foreground py-8'>
                    No abandoned carts detected for threshold &gt; {data.thresholdHours} hours.
                  </TableCell>
                </TableRow>
              ) : (
                data.abandonedCarts.map((cart) => (
                  <TableRow key={cart.id}>
                    <TableCell className='font-medium'>{cart.userName}</TableCell>
                    <TableCell className='text-muted-foreground'>{cart.userEmail}</TableCell>
                    <TableCell className='text-center'>
                      <Badge variant='outline' className='flex items-center gap-1 w-fit mx-auto border-amber-500/50 text-amber-600 dark:text-amber-400'>
                        <Clock className='h-3 w-3' /> {cart.inactivityHours}h inactive
                      </Badge>
                    </TableCell>
                    <TableCell className='text-center text-sm text-muted-foreground'>
                      {formatDateTime(new Date(cart.createdAt)).dateTime}
                    </TableCell>
                    <TableCell className='text-center font-bold'>{cart.itemsCount}</TableCell>
                    <TableCell className='text-sm max-w-[250px] truncate'>
                      {cart.items.map((item) => `${item.name} (${item.qty})`).join(', ')}
                    </TableCell>
                    <TableCell className='text-right font-bold text-destructive'>
                      {formatCurrency(cart.totalPrice)}
                    </TableCell>
                    <TableCell className='text-center'>
                      <Badge variant='destructive' className='bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/30'>
                        Abandoned
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
