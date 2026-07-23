export interface ProductRecord {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  stock: number;
  price: number | string | { toString(): string };
  images: string[];
  createdAt?: Date | string;
}

export interface OrderItemRecord {
  productId: string;
  qty: number;
  price: number | string | { toString(): string };
  name?: string;
}

export interface TopSellingProduct {
  productId: string;
  name: string;
  slug: string;
  category: string;
  stock: number;
  totalQtySold: number;
  totalRevenueGenerated: number;
  image?: string;
}

export interface InventoryKPIs {
  totalProductsCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStockQuantity: number;
}

/**
 * Pure helper function to filter and sort low-stock products needing restocking.
 */
export function filterLowStockProducts(
  products: ProductRecord[],
  threshold: number = 10
): ProductRecord[] {
  return products
    .filter((p) => p.stock <= threshold)
    .sort((a, b) => a.stock - b.stock);
}

/**
 * Pure helper function to compute top selling products ranked by order volume.
 */
export function calculateTopSellingProducts(
  products: ProductRecord[],
  orderItems: OrderItemRecord[]
): TopSellingProduct[] {
  const salesMap: Record<string, { totalQtySold: number; totalRevenueGenerated: number }> = {};

  for (const item of orderItems) {
    const numPrice = Number(item.price.toString());
    if (!salesMap[item.productId]) {
      salesMap[item.productId] = { totalQtySold: 0, totalRevenueGenerated: 0 };
    }
    salesMap[item.productId].totalQtySold += item.qty;
    salesMap[item.productId].totalRevenueGenerated += item.qty * numPrice;
  }

  const productMap: Record<string, ProductRecord> = {};
  for (const p of products) {
    productMap[p.id] = p;
  }

  const result: TopSellingProduct[] = [];
  for (const [productId, stats] of Object.entries(salesMap)) {
    const prod = productMap[productId];
    if (prod) {
      result.push({
        productId,
        name: prod.name,
        slug: prod.slug,
        category: prod.category,
        stock: prod.stock,
        totalQtySold: stats.totalQtySold,
        totalRevenueGenerated: Number(stats.totalRevenueGenerated.toFixed(2)),
        image: prod.images && prod.images.length > 0 ? prod.images[0] : undefined,
      });
    }
  }

  return result.sort((a, b) => b.totalQtySold - a.totalQtySold);
}

/**
 * Pure helper function to compute aggregate inventory KPIs.
 */
export function calculateInventoryKPIs(
  products: ProductRecord[],
  threshold: number = 10
): InventoryKPIs {
  const totalProductsCount = products.length;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let totalStockQuantity = 0;

  for (const p of products) {
    totalStockQuantity += p.stock;
    if (p.stock <= threshold) {
      lowStockCount++;
    }
    if (p.stock === 0) {
      outOfStockCount++;
    }
  }

  return {
    totalProductsCount,
    lowStockCount,
    outOfStockCount,
    totalStockQuantity,
  };
}

export type StockStatus = 'out_of_stock' | 'low_stock' | 'in_stock';

export function getStockBadgeStatus(stock: number, threshold: number = 10): StockStatus {
  if (stock <= 0) return 'out_of_stock';
  if (stock <= threshold) return 'low_stock';
  return 'in_stock';
}
