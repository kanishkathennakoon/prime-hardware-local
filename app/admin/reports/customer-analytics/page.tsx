import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getCustomerAnalyticsData } from '@/lib/actions/report.actions';
import ReportsNav from '@/components/admin/reports-nav';
import CustomerAnalyticsFilter from '@/components/admin/customer-analytics-filter';
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

import { DollarSign, ShoppingBag, Users, TrendingUp, Award, UserCheck } from 'lucide-react';

export const metadata = {
  title: 'Customer Analytics - Admin Dashboard',
};

interface CustomerAnalyticsPageProps {
  searchParams: Promise<{
    minSpend?: string;
    minOrders?: string;
    sortBy?: 'lifetime_spend_desc' | 'order_count_desc' | 'last_order_desc' | 'name_asc';
  }>;
}

export default async function CustomerAnalyticsPage({ searchParams }: CustomerAnalyticsPageProps) {
  const session = await auth();
  if (!session || session?.user?.role !== 'admin') {
    redirect('/unauthorized');
  }

  const { minSpend: minSpendParam, minOrders: minOrdersParam, sortBy } = await searchParams;

  const minSpend = minSpendParam ? parseFloat(minSpendParam) : undefined;
  const minOrders = minOrdersParam ? parseInt(minOrdersParam, 10) : undefined;

  const reportResult = await getCustomerAnalyticsData({
    minSpend,
    minOrders,
    sortBy,
  });

  const data = reportResult.data || {
    kpis: {
      totalCustomersCount: 0,
      activeCustomersCount: 0,
      totalCustomerSpend: 0,
      averageSpendPerCustomer: 0,
      repeatCustomerRate: 0,
    },
    customers: [],
  };

  const getCustomerSegmentBadge = (orders: number, spend: number) => {
    if (orders >= 3 || spend >= 500) {
      return <Badge className='bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20'>VIP / High Value</Badge>;
    }
    if (orders > 1) {
      return <Badge variant='secondary' className='bg-primary/10 text-primary'>Repeat Buyer</Badge>;
    }
    if (orders === 1) {
      return <Badge variant='outline'>One-Time Buyer</Badge>;
    }
    return <Badge variant='outline' className='text-muted-foreground border-dashed'>Inactive</Badge>;
  };

  return (
    <div className='space-y-6'>
      <ReportsNav />

      <div>
        <h1 className='h2-bold'>Customer Analytics Report</h1>
        <p className='text-muted-foreground'>
          Analyze customer purchasing behavior, total lifetime spend, order frequencies, and retention metrics.
        </p>
      </div>

      <CustomerAnalyticsFilter
        initialMinSpend={minSpend}
        initialMinOrders={minOrders}
        initialSortBy={sortBy}
      />

      {/* KPI Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Registered Customers</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.kpis.totalCustomersCount}</div>
            <p className='text-xs text-muted-foreground'>Registered accounts in store</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Purchasing Customers</CardTitle>
            <UserCheck className='h-4 w-4 text-emerald-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-emerald-600 dark:text-emerald-400'>
              {data.kpis.activeCustomersCount}
            </div>
            <p className='text-xs text-muted-foreground'>Placed at least 1 completed order</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Avg Spend per Customer</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatCurrency(data.kpis.averageSpendPerCustomer)}</div>
            <p className='text-xs text-muted-foreground'>Average lifetime revenue per active customer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Repeat Customer Rate</CardTitle>
            <TrendingUp className='h-4 w-4 text-primary' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.kpis.repeatCustomerRate}%</div>
            <p className='text-xs text-muted-foreground'>Active customers with 2+ orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Purchasing Behavior & Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Award className='h-5 w-5 text-primary' /> Customer Purchasing Behavior Leaderboard
          </CardTitle>
          <p className='text-sm text-muted-foreground'>
            Individual buyer breakdown by order frequency, lifetime spend, and average order value.
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[60px]'>Rank</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead className='text-right'>Total Orders</TableHead>
                <TableHead className='text-right'>Lifetime Spend</TableHead>
                <TableHead className='text-right'>Average Order Value</TableHead>
                <TableHead className='text-center'>Last Order Date</TableHead>
                <TableHead className='text-center'>Segment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className='text-center text-muted-foreground py-8'>
                    No customer analytics records match the selected filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                data.customers.map((customer, index) => (
                  <TableRow key={customer.userId}>
                    <TableCell className='font-bold text-muted-foreground'>#{index + 1}</TableCell>
                    <TableCell className='font-medium'>{customer.name}</TableCell>
                    <TableCell className='text-muted-foreground'>{customer.email}</TableCell>
                    <TableCell className='text-right font-semibold'>{customer.totalOrders}</TableCell>
                    <TableCell className='text-right font-bold text-emerald-600 dark:text-emerald-400'>
                      {formatCurrency(customer.totalSpend)}
                    </TableCell>
                    <TableCell className='text-right'>{formatCurrency(customer.averageOrderValue)}</TableCell>
                    <TableCell className='text-center text-sm text-muted-foreground'>
                      {customer.lastOrderDate
                        ? formatDateTime(new Date(customer.lastOrderDate)).dateTime
                        : 'No orders placed'}
                    </TableCell>

                    <TableCell className='text-center'>
                      {getCustomerSegmentBadge(customer.totalOrders, customer.totalSpend)}
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
