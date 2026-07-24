export interface CustomerOrderInput {
  id: string;
  totalPrice: string | number;
  createdAt: Date | string;
}

export interface UserWithOrdersInput {
  id: string;
  name: string;
  email: string;
  role?: string;
  Order?: CustomerOrderInput[];
}

export interface CustomerMetric {
  userId: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpend: number;
  averageOrderValue: number;
  lastOrderDate: Date | null;
  firstOrderDate: Date | null;
}

export interface CustomerAnalyticsKPIs {
  totalCustomersCount: number;
  activeCustomersCount: number;
  totalCustomerSpend: number;
  averageSpendPerCustomer: number;
  repeatCustomerRate: number;
}

export function calculateCustomerMetrics(users: UserWithOrdersInput[]): CustomerMetric[] {
  return users.map((user) => {
    const orders = user.Order || [];
    const totalOrders = orders.length;

    let totalSpend = 0;
    let lastOrderDate: Date | null = null;
    let firstOrderDate: Date | null = null;

    if (totalOrders > 0) {
      const dates: Date[] = [];
      orders.forEach((order) => {
        const orderPrice = Number(order.totalPrice) || 0;
        totalSpend += orderPrice;
        const dateObj = new Date(order.createdAt);
        if (!isNaN(dateObj.getTime())) {
          dates.push(dateObj);
        }
      });

      if (dates.length > 0) {
        dates.sort((a, b) => a.getTime() - b.getTime());
        firstOrderDate = dates[0];
        lastOrderDate = dates[dates.length - 1];
      }
    }

    const averageOrderValue = totalOrders > 0 ? totalSpend / totalOrders : 0;

    return {
      userId: user.id,
      name: user.name || 'Anonymous User',
      email: user.email,
      totalOrders,
      totalSpend: Number(totalSpend.toFixed(2)),
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
      lastOrderDate,
      firstOrderDate,
    };
  });
}

export function calculateCustomerKPIs(metrics: CustomerMetric[]): CustomerAnalyticsKPIs {
  const totalCustomersCount = metrics.length;
  const activeCustomers = metrics.filter((m) => m.totalOrders > 0);
  const activeCustomersCount = activeCustomers.length;

  const totalCustomerSpend = activeCustomers.reduce((acc, curr) => acc + curr.totalSpend, 0);

  const averageSpendPerCustomer =
    activeCustomersCount > 0 ? totalCustomerSpend / activeCustomersCount : 0;

  const repeatCustomersCount = activeCustomers.filter((m) => m.totalOrders > 1).length;
  const repeatCustomerRate =
    activeCustomersCount > 0 ? (repeatCustomersCount / activeCustomersCount) * 100 : 0;

  return {
    totalCustomersCount,
    activeCustomersCount,
    totalCustomerSpend: Number(totalCustomerSpend.toFixed(2)),
    averageSpendPerCustomer: Number(averageSpendPerCustomer.toFixed(2)),
    repeatCustomerRate: Number(repeatCustomerRate.toFixed(1)),
  };
}

export function filterAndSortCustomers(
  metrics: CustomerMetric[],
  params?: {
    minSpend?: number;
    minOrders?: number;
    sortBy?: 'lifetime_spend_desc' | 'order_count_desc' | 'last_order_desc' | 'name_asc';
  }
): CustomerMetric[] {
  let filtered = [...metrics];

  if (params?.minSpend !== undefined && !isNaN(params.minSpend)) {
    filtered = filtered.filter((m) => m.totalSpend >= params.minSpend!);
  }

  if (params?.minOrders !== undefined && !isNaN(params.minOrders)) {
    filtered = filtered.filter((m) => m.totalOrders >= params.minOrders!);
  }

  const sortBy = params?.sortBy || 'lifetime_spend_desc';

  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'lifetime_spend_desc':
        return b.totalSpend - a.totalSpend;
      case 'order_count_desc':
        return b.totalOrders - a.totalOrders;
      case 'last_order_desc': {
        const timeA = a.lastOrderDate ? a.lastOrderDate.getTime() : 0;
        const timeB = b.lastOrderDate ? b.lastOrderDate.getTime() : 0;
        return timeB - timeA;
      }
      case 'name_asc':
        return a.name.localeCompare(b.name);
      default:
        return b.totalSpend - a.totalSpend;
    }
  });

  return filtered;
}
