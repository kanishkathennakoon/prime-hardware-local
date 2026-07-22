'use server';

import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { salesReportQuerySchema, inventoryReportQuerySchema } from '../validators';
import {
  formatMonthlySales,
  calculateSalesKPIs,
  MonthlySalesData,
  SalesReportKPIs,
} from '../utils/sales-report-helpers';
import {
  filterLowStockProducts,
  calculateTopSellingProducts,
  calculateInventoryKPIs,
  ProductRecord,
  OrderItemRecord,
  TopSellingProduct,
  InventoryKPIs,
} from '../utils/inventory-report-helpers';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

export interface SalesReportResponseData extends SalesReportKPIs {
  monthlySales: MonthlySalesData[];
  startDate?: string;
  endDate?: string;
}

export async function getSalesReportData(
  queryInput?: z.input<typeof salesReportQuerySchema>
): Promise<{
  success: boolean;
  data?: SalesReportResponseData;
  message?: string;
}> {
  try {
    const session = await auth();
    if (!session || session?.user?.role !== 'admin') {
      return {
        success: false,
        message: 'User is not authorized',
      };
    }

    const validationResult = salesReportQuerySchema.safeParse(queryInput || {});
    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error.issues[0]?.message || 'Invalid parameters',
      };
    }

    const { startDate, endDate } = validationResult.data;
    const whereClause: { createdAt?: { gte?: Date; lte?: Date } } = {};

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const rawOrders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
    });

    const monthlySales = formatMonthlySales(rawOrders);
    const kpis = calculateSalesKPIs(rawOrders);

    return {
      success: true,
      data: {
        ...kpis,
        monthlySales,
        startDate,
        endDate,
      },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sales report data';
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export interface InventoryReportResponseData {
  kpis: InventoryKPIs;
  lowStockItems: ProductRecord[];
  topSellingItems: TopSellingProduct[];
  allProducts: ProductRecord[];
  categories: string[];
  threshold: number;
}

export async function getInventoryReportData(
  queryInput?: z.input<typeof inventoryReportQuerySchema>
): Promise<{
  success: boolean;
  data?: InventoryReportResponseData;
  message?: string;
}> {
  try {
    const session = await auth();
    if (!session || session?.user?.role !== 'admin') {
      return {
        success: false,
        message: 'User is not authorized',
      };
    }

    const validationResult = inventoryReportQuerySchema.safeParse(queryInput || {});
    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error.issues[0]?.message || 'Invalid parameters',
      };
    }

    const { threshold, category, sortBy } = validationResult.data;

    const whereClause: Prisma.ProductWhereInput = {};
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { stock: 'asc' };
    if (sortBy === 'stock_desc') orderBy = { stock: 'desc' };
    if (sortBy === 'name_asc') orderBy = { name: 'asc' };

    const productsRaw = await prisma.product.findMany({
      where: whereClause,
      orderBy,
    });

    const products: ProductRecord[] = productsRaw.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      brand: p.brand,
      stock: p.stock,
      price: Number(p.price),
      images: p.images,
      createdAt: p.createdAt,
    }));

    const orderItemsRaw = await prisma.orderItem.findMany();
    const orderItems: OrderItemRecord[] = orderItemsRaw.map((item) => ({
      productId: item.productId,
      qty: item.qty,
      price: Number(item.price),
      name: item.name,
    }));

    const categoriesRaw = await prisma.product.groupBy({
      by: ['category'],
    });
    const categories = categoriesRaw.map((c) => c.category);

    const kpis = calculateInventoryKPIs(products, threshold);
    const lowStockItems = filterLowStockProducts(products, threshold);
    const topSellingItems = calculateTopSellingProducts(products, orderItems);

    return {
      success: true,
      data: {
        kpis,
        lowStockItems,
        topSellingItems,
        allProducts: products,
        categories,
        threshold,
      },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch inventory report data';
    return {
      success: false,
      message: errorMessage,
    };
  }
}
