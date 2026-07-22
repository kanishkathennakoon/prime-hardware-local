export interface OrderSalesRecord {
  id?: string;
  totalPrice: number | string | { toString(): string };
  createdAt: Date | string;
}

export interface MonthlySalesData {
  month: string;
  totalSales: number;
  orderCount: number;
}

export interface SalesReportKPIs {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

/**
 * Pure helper function to format raw order records into monthly aggregates.
 * Formats month key as "MM/YY".
 */
export function formatMonthlySales(orders: OrderSalesRecord[]): MonthlySalesData[] {
  const monthlyMap: Record<string, { totalSales: number; orderCount: number }> = {};

  for (const order of orders) {
    const date = new Date(order.createdAt);
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = String(date.getUTCFullYear()).slice(-2);
    const key = `${month}/${year}`;

    const numPrice = Number(order.totalPrice.toString());

    if (!monthlyMap[key]) {
      monthlyMap[key] = { totalSales: 0, orderCount: 0 };
    }

    monthlyMap[key].totalSales += numPrice;
    monthlyMap[key].orderCount += 1;
  }

  return Object.entries(monthlyMap).map(([month, val]) => ({
    month,
    totalSales: Number(val.totalSales.toFixed(2)),
    orderCount: val.orderCount,
  }));
}

/**
 * Pure helper function to calculate aggregate KPIs for sales reporting.
 */
export function calculateSalesKPIs(orders: OrderSalesRecord[]): SalesReportKPIs {
  const totalOrders = orders.length;
  if (totalOrders === 0) {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
    };
  }

  const totalRevenue = orders.reduce((sum, order) => {
    return sum + Number(order.totalPrice.toString());
  }, 0);

  const roundedTotalRevenue = Number(totalRevenue.toFixed(2));
  const averageOrderValue = Number((totalRevenue / totalOrders).toFixed(2));

  return {
    totalRevenue: roundedTotalRevenue,
    totalOrders,
    averageOrderValue,
  };
}
