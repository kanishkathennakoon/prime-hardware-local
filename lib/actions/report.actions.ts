'use server';

import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { salesReportQuerySchema } from '../validators';
import {
  formatMonthlySales,
  calculateSalesKPIs,
  MonthlySalesData,
  SalesReportKPIs,
} from '../utils/sales-report-helpers';
import { z } from 'zod';

export interface SalesReportResponseData extends SalesReportKPIs {
  monthlySales: MonthlySalesData[];
  startDate?: string;
  endDate?: string;
}

export async function getSalesReportData(
  queryInput?: z.infer<typeof salesReportQuerySchema>
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
