export interface CartItemRecord {
  productId: string;
  name: string;
  slug?: string;
  qty: number;
  price: string | number;
  image?: string;
}

export interface RawCartRecord {
  id: string;
  userId: string | null;
  sessionCartId: string;
  items: CartItemRecord[] | unknown[];
  itemsPrice: string | number;
  totalPrice: string | number;
  shippingPrice: string | number;
  taxPrice: string | number;
  createdAt: Date | string;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

export interface AbandonedCartRecord {
  id: string;
  userId: string | null;
  sessionCartId: string;
  userName: string;
  userEmail: string;
  items: CartItemRecord[];
  itemsCount: number;
  totalPrice: number;
  createdAt: Date;
  inactivityHours: number;
}

export interface AbandonedCartKPIs {
  totalAbandonedCartsCount: number;
  totalLostRevenue: number;
  averageCartValue: number;
  totalUnpurchasedItems: number;
  thresholdHours: number;
}

export function filterAbandonedCarts(
  carts: RawCartRecord[],
  thresholdHours: number = 24,
  nowDate: Date = new Date()
): AbandonedCartRecord[] {
  const cutoffTime = nowDate.getTime() - thresholdHours * 60 * 60 * 1000;

  return carts
    .filter((cart) => {
      const items = Array.isArray(cart.items) ? (cart.items as CartItemRecord[]) : [];
      if (items.length === 0) return false;

      const cartCreatedTime = new Date(cart.createdAt).getTime();
      return cartCreatedTime <= cutoffTime;
    })
    .map((cart) => {
      const items = Array.isArray(cart.items) ? (cart.items as CartItemRecord[]) : [];
      const cartCreatedAt = new Date(cart.createdAt);
      const diffMs = nowDate.getTime() - cartCreatedAt.getTime();
      const inactivityHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

      const totalItemsCount = items.reduce((sum, item) => sum + (Number(item.qty) || 1), 0);

      return {
        id: cart.id,
        userId: cart.userId,
        sessionCartId: cart.sessionCartId,
        userName: cart.user?.name || 'Guest User',
        userEmail: cart.user?.email || 'N/A (Guest)',
        items,
        itemsCount: totalItemsCount,
        totalPrice: Number(cart.totalPrice) || 0,
        createdAt: cartCreatedAt,
        inactivityHours,
      };
    });
}

export function calculateAbandonedCartKPIs(
  abandonedCarts: AbandonedCartRecord[],
  thresholdHours: number = 24
): AbandonedCartKPIs {
  const totalAbandonedCartsCount = abandonedCarts.length;

  const totalLostRevenue = abandonedCarts.reduce((acc, curr) => acc + curr.totalPrice, 0);

  const averageCartValue =
    totalAbandonedCartsCount > 0 ? totalLostRevenue / totalAbandonedCartsCount : 0;

  const totalUnpurchasedItems = abandonedCarts.reduce(
    (acc, curr) => acc + curr.itemsCount,
    0
  );

  return {
    totalAbandonedCartsCount,
    totalLostRevenue: Number(totalLostRevenue.toFixed(2)),
    averageCartValue: Number(averageCartValue.toFixed(2)),
    totalUnpurchasedItems,
    thresholdHours,
  };
}

export function sortAbandonedCarts(
  carts: AbandonedCartRecord[],
  sortBy: 'created_at_desc' | 'created_at_asc' | 'total_price_desc' | 'items_count_desc' = 'created_at_desc'
): AbandonedCartRecord[] {
  const sorted = [...carts];

  sorted.sort((a, b) => {
    switch (sortBy) {
      case 'created_at_desc':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'created_at_asc':
        return a.createdAt.getTime() - b.createdAt.getTime();
      case 'total_price_desc':
        return b.totalPrice - a.totalPrice;
      case 'items_count_desc':
        return b.itemsCount - a.itemsCount;
      default:
        return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  return sorted;
}
