import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getInventoryReportData } from '@/lib/actions/report.actions';
import ReportsNav from '@/components/admin/reports-nav';
import InventoryReportFilter from '@/components/admin/inventory-report-filter';
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
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { getStockBadgeStatus } from '@/lib/utils/inventory-report-helpers';
import { AlertTriangle, Boxes, Package, PackageX, TrendingUp, Edit } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Inventory Report - Admin Dashboard',
};

interface InventoryReportPageProps {
  searchParams: Promise<{
    threshold?: string;
    category?: string;
    sortBy?: 'stock_asc' | 'stock_desc' | 'sales_volume_desc' | 'name_asc';
  }>;
}

export default async function InventoryReportPage({ searchParams }: InventoryReportPageProps) {
  const session = await auth();
  if (!session || session?.user?.role !== 'admin') {
    redirect('/unauthorized');
  }

  const { threshold: thresholdParam, category, sortBy } = await searchParams;
  const threshold = thresholdParam ? parseInt(thresholdParam, 10) : 10;

  const reportResult = await getInventoryReportData({
    threshold,
    category,
    sortBy,
  });

  const data = reportResult.data || {
    kpis: {
      totalProductsCount: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      totalStockQuantity: 0,
    },
    lowStockItems: [],
    topSellingItems: [],
    allProducts: [],
    categories: [],
    threshold: 10,
  };

  return (
    <div className='space-y-6'>
      <ReportsNav />

      <div>
        <h1 className='h2-bold'>Inventory Management Report</h1>
        <p className='text-muted-foreground'>
          Monitor stock levels, highlight low-stock restocking alerts, and track top-selling products by order volume.
        </p>
      </div>

      <InventoryReportFilter
        initialThreshold={threshold}
        initialCategory={category}
        initialSortBy={sortBy}
        categories={data.categories}
      />

      {/* KPI Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Products</CardTitle>
            <Package className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.kpis.totalProductsCount}</div>
            <p className='text-xs text-muted-foreground'>Active catalog products</p>
          </CardContent>
        </Card>

        <Card className={data.kpis.lowStockCount > 0 ? 'border-amber-500/50 bg-amber-500/5' : ''}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Low Stock Alerts</CardTitle>
            <AlertTriangle className='h-4 w-4 text-amber-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-amber-600 dark:text-amber-400'>
              {data.kpis.lowStockCount}
            </div>
            <p className='text-xs text-muted-foreground'>
              Stock &le; {data.threshold} units
            </p>
          </CardContent>
        </Card>

        <Card className={data.kpis.outOfStockCount > 0 ? 'border-destructive/50 bg-destructive/5' : ''}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Out of Stock</CardTitle>
            <PackageX className='h-4 w-4 text-destructive' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-destructive'>
              {data.kpis.outOfStockCount}
            </div>
            <p className='text-xs text-muted-foreground'>0 remaining stock units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Stock Quantity</CardTitle>
            <Boxes className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.kpis.totalStockQuantity}</div>
            <p className='text-xs text-muted-foreground'>Total inventory items in store</p>
          </CardContent>
        </Card>
      </div>

      {/* Low-Stock Restocking Alerts Table */}
      <Card className='border-amber-500/30'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2 text-amber-600 dark:text-amber-400'>
              <AlertTriangle className='h-5 w-5' /> Low-Stock Restocking Alerts
            </CardTitle>
            <p className='text-sm text-muted-foreground mt-1'>
              Products with stock quantity at or below {data.threshold} requiring restocking action.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead className='text-right'>Price</TableHead>
                <TableHead className='text-center'>Stock Level</TableHead>
                <TableHead className='text-center'>Status</TableHead>
                <TableHead className='text-right'>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.lowStockItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='text-center text-muted-foreground py-6'>
                    No low-stock items detected for threshold &le; {data.threshold}.
                  </TableCell>
                </TableRow>
              ) : (
                data.lowStockItems.map((item) => {
                  const status = getStockBadgeStatus(item.stock, data.threshold);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className='font-medium'>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.brand}</TableCell>
                      <TableCell className='text-right'>{formatCurrency(Number(item.price))}</TableCell>
                      <TableCell className='text-center font-bold'>{item.stock}</TableCell>
                      <TableCell className='text-center'>
                        {status === 'out_of_stock' ? (
                          <Badge variant='destructive'>Out of Stock</Badge>
                        ) : (
                          <Badge variant='secondary' className='bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'>
                            Low Stock
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button asChild size='sm' variant='outline'>
                          <Link href={`/admin/products/${item.id}`}>
                            <Edit className='h-3.5 w-3.5 mr-1' /> Edit
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top-Selling Products Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5 text-primary' /> Top-Selling Products Leaderboard
          </CardTitle>
          <p className='text-sm text-muted-foreground'>
            Products ranked by total units sold across order history.
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className='text-right'>Units Sold</TableHead>
                <TableHead className='text-right'>Revenue Generated</TableHead>
                <TableHead className='text-center'>Current Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topSellingItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='text-center text-muted-foreground py-6'>
                    No sales history recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                data.topSellingItems.map((item, index) => (
                  <TableRow key={item.productId}>
                    <TableCell className='font-bold'>#{index + 1}</TableCell>
                    <TableCell className='font-medium'>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className='text-right font-semibold'>{item.totalQtySold}</TableCell>
                    <TableCell className='text-right'>{formatCurrency(item.totalRevenueGenerated)}</TableCell>
                    <TableCell className='text-center'>{item.stock}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Comprehensive Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className='text-right'>Price</TableHead>
                <TableHead className='text-center'>Current Stock</TableHead>
                <TableHead className='text-center'>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.allProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className='text-center text-muted-foreground py-6'>
                    No products found matching filters.
                  </TableCell>
                </TableRow>
              ) : (
                data.allProducts.map((product) => {
                  const status = getStockBadgeStatus(product.stock, data.threshold);
                  return (
                    <TableRow key={product.id}>
                      <TableCell className='font-medium'>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className='text-right'>{formatCurrency(Number(product.price))}</TableCell>
                      <TableCell className='text-center font-bold'>{product.stock}</TableCell>
                      <TableCell className='text-center'>
                        {status === 'out_of_stock' ? (
                          <Badge variant='destructive'>Out of Stock</Badge>
                        ) : status === 'low_stock' ? (
                          <Badge variant='secondary' className='bg-amber-500/10 text-amber-600'>
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant='outline' className='border-emerald-500 text-emerald-600'>
                            In Stock
                          </Badge>
                        )}
                      </TableCell>
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
