import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import sampleData from './sample-data';
import { hash } from '@/lib/encrypt';

async function main() {
  const prisma = new PrismaClient();

  // Clean existing tables in proper relational order
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Products
  const createdProducts = await Promise.all(
    sampleData.products.map((product) => prisma.product.create({ data: product }))
  );
  console.log(`Seeded ${createdProducts.length} products.`);

  // 2. Seed Users
  const createdUsers = [];
  for (const u of sampleData.users) {
    const hashedPassword = await hash(u.password);
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role,
        address: {
          fullName: u.name,
          streetAddress: '123 Main St',
          city: 'Colombo',
          postalCode: '00100',
          country: 'Sri Lanka',
        },
        paymentMethod: 'PayPal',
      },
    });
    createdUsers.push(user);
  }
  console.log(`Seeded ${createdUsers.length} users.`);

  const regularUser = createdUsers.find((u) => u.role === 'user') || createdUsers[1];
  const sarahUser = createdUsers.find((u) => u.email === 'sarah@example.com') || regularUser;
  const davidUser = createdUsers.find((u) => u.email === 'david@example.com') || regularUser;

  // 3. Seed Sample Orders & OrderItems across past months for Sales & Customer Reports
  const sampleOrdersData = [
    {
      userId: regularUser.id,
      createdAt: new Date('2025-11-15T10:00:00Z'),
      itemsPrice: 145.89,
      shippingPrice: 10.0,
      taxPrice: 15.0,
      totalPrice: 170.89,
      isPaid: true,
      paidAt: new Date('2025-11-15T10:05:00Z'),
      isDelivered: true,
      deliveredAt: new Date('2025-11-17T14:00:00Z'),
      paymentMethod: 'PayPal',
      shippingAddress: { fullName: regularUser.name, streetAddress: '123 Main St', city: 'Colombo', postalCode: '00100', country: 'Sri Lanka' },
      items: [
        { productIndex: 0, qty: 1, price: 59.99 },
        { productIndex: 1, qty: 1, price: 85.90 },
      ],
    },
    {
      userId: regularUser.id,
      createdAt: new Date('2025-12-05T14:30:00Z'),
      itemsPrice: 285.80,
      shippingPrice: 15.0,
      taxPrice: 28.58,
      totalPrice: 329.38,
      isPaid: true,
      paidAt: new Date('2025-12-05T14:35:00Z'),
      isDelivered: true,
      deliveredAt: new Date('2025-12-08T11:20:00Z'),
      paymentMethod: 'PayPal',
      shippingAddress: { fullName: regularUser.name, streetAddress: '123 Main St', city: 'Colombo', postalCode: '00100', country: 'Sri Lanka' },
      items: [
        { productIndex: 1, qty: 2, price: 85.90 },
        { productIndex: 3, qty: 2, price: 57.00 },
      ],
    },
    {
      userId: sarahUser.id,
      createdAt: new Date('2026-01-20T09:15:00Z'),
      itemsPrice: 220.00,
      shippingPrice: 10.0,
      taxPrice: 22.0,
      totalPrice: 252.00,
      isPaid: true,
      paidAt: new Date('2026-01-20T09:20:00Z'),
      isDelivered: true,
      deliveredAt: new Date('2026-01-22T16:00:00Z'),
      paymentMethod: 'CashOnDelivery',
      shippingAddress: { fullName: 'Sarah Jenkins', streetAddress: '45 Galle Rd', city: 'Dehiwala', postalCode: '10350', country: 'Sri Lanka' },
      items: [
        { productIndex: 4, qty: 2, price: 79.99 },
        { productIndex: 0, qty: 1, price: 60.02 },
      ],
    },
    {
      userId: davidUser.id,
      createdAt: new Date('2026-02-14T11:00:00Z'),
      itemsPrice: 175.90,
      shippingPrice: 10.0,
      taxPrice: 17.59,
      totalPrice: 203.49,
      isPaid: true,
      paidAt: new Date('2026-02-14T11:05:00Z'),
      isDelivered: true,
      deliveredAt: new Date('2026-02-16T15:30:00Z'),
      paymentMethod: 'PayPal',
      shippingAddress: { fullName: 'David Perera', streetAddress: '78 Kandy Rd', city: 'Kiribathgoda', postalCode: '11600', country: 'Sri Lanka' },
      items: [
        { productIndex: 1, qty: 1, price: 85.90 },
        { productIndex: 2, qty: 1, price: 90.00 },
      ],
    },
    {
      userId: regularUser.id,
      createdAt: new Date('2026-03-10T16:45:00Z'),
      itemsPrice: 340.00,
      shippingPrice: 15.0,
      taxPrice: 34.0,
      totalPrice: 389.00,
      isPaid: true,
      paidAt: new Date('2026-03-10T16:50:00Z'),
      isDelivered: true,
      deliveredAt: new Date('2026-03-12T10:00:00Z'),
      paymentMethod: 'CashOnDelivery',
      shippingAddress: { fullName: regularUser.name, streetAddress: '123 Main St', city: 'Colombo', postalCode: '00100', country: 'Sri Lanka' },
      items: [
        { productIndex: 0, qty: 3, price: 59.99 },
        { productIndex: 4, qty: 2, price: 79.99 },
      ],
    },
    {
      userId: sarahUser.id,
      createdAt: new Date('2026-04-05T08:20:00Z'),
      itemsPrice: 420.50,
      shippingPrice: 20.0,
      taxPrice: 42.05,
      totalPrice: 482.55,
      isPaid: true,
      paidAt: new Date('2026-04-05T08:25:00Z'),
      isDelivered: true,
      deliveredAt: new Date('2026-04-08T13:00:00Z'),
      paymentMethod: 'PayPal',
      shippingAddress: { fullName: 'Sarah Jenkins', streetAddress: '45 Galle Rd', city: 'Dehiwala', postalCode: '10350', country: 'Sri Lanka' },
      items: [
        { productIndex: 1, qty: 3, price: 85.90 },
        { productIndex: 2, qty: 1, price: 99.95 },
        { productIndex: 5, qty: 1, price: 62.90 },
      ],
    },
    {
      userId: regularUser.id,
      createdAt: new Date('2026-05-18T13:10:00Z'),
      itemsPrice: 199.90,
      shippingPrice: 10.0,
      taxPrice: 19.99,
      totalPrice: 229.89,
      isPaid: true,
      paidAt: new Date('2026-05-18T13:15:00Z'),
      isDelivered: true,
      deliveredAt: new Date('2026-05-20T17:45:00Z'),
      paymentMethod: 'CashOnDelivery',
      shippingAddress: { fullName: regularUser.name, streetAddress: '123 Main St', city: 'Colombo', postalCode: '00100', country: 'Sri Lanka' },
      items: [
        { productIndex: 2, qty: 2, price: 99.95 },
      ],
    },
    {
      userId: davidUser.id,
      createdAt: new Date('2026-06-22T15:00:00Z'),
      itemsPrice: 310.00,
      shippingPrice: 15.0,
      taxPrice: 31.0,
      totalPrice: 356.00,
      isPaid: true,
      paidAt: new Date('2026-06-22T15:05:00Z'),
      isDelivered: true,
      deliveredAt: new Date('2026-06-24T12:00:00Z'),
      paymentMethod: 'PayPal',
      shippingAddress: { fullName: 'David Perera', streetAddress: '78 Kandy Rd', city: 'Kiribathgoda', postalCode: '11600', country: 'Sri Lanka' },
      items: [
        { productIndex: 0, qty: 2, price: 59.99 },
        { productIndex: 4, qty: 2, price: 79.99 },
        { productIndex: 3, qty: 1, price: 30.04 },
      ],
    },
    {
      userId: regularUser.id,
      createdAt: new Date('2026-07-10T11:30:00Z'),
      itemsPrice: 159.95,
      shippingPrice: 10.0,
      taxPrice: 15.99,
      totalPrice: 185.94,
      isPaid: true,
      paidAt: new Date('2026-07-10T11:35:00Z'),
      isDelivered: false,
      deliveredAt: null,
      paymentMethod: 'PayPal',
      shippingAddress: { fullName: regularUser.name, streetAddress: '123 Main St', city: 'Colombo', postalCode: '00100', country: 'Sri Lanka' },
      items: [
        { productIndex: 2, qty: 1, price: 99.95 },
        { productIndex: 0, qty: 1, price: 60.00 },
      ],
    },
  ];

  let orderCount = 0;
  for (const orderData of sampleOrdersData) {
    const order = await prisma.order.create({
      data: {
        userId: orderData.userId,
        createdAt: orderData.createdAt,
        itemsPrice: orderData.itemsPrice,
        shippingPrice: orderData.shippingPrice,
        taxPrice: orderData.taxPrice,
        totalPrice: orderData.totalPrice,
        isPaid: orderData.isPaid,
        paidAt: orderData.paidAt,
        isDelivered: orderData.isDelivered,
        deliveredAt: orderData.deliveredAt,
        paymentMethod: orderData.paymentMethod,
        shippingAddress: orderData.shippingAddress,
      },
    });

    for (const item of orderData.items) {
      const prod = createdProducts[item.productIndex];
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: prod.id,
          qty: item.qty,
          price: item.price,
          name: prod.name,
          slug: prod.slug,
          image: prod.images[0],
        },
      });
    }
    orderCount++;
  }
  console.log(`Seeded ${orderCount} orders with order items.`);

  // 4. Seed Abandoned Cart (Appendix C.4 testing)
  const abandonedDate = new Date();
  abandonedDate.setDate(abandonedDate.getDate() - 10);

  await prisma.cart.create({
    data: {
      userId: sarahUser.id,
      sessionCartId: 'abandoned-cart-session-999',
      items: [
        {
          productId: createdProducts[0].id,
          name: createdProducts[0].name,
          slug: createdProducts[0].slug,
          qty: 2,
          image: createdProducts[0].images[0],
          price: createdProducts[0].price.toString(),
        },
      ],
      itemsPrice: 119.98,
      shippingPrice: 10.0,
      taxPrice: 12.0,
      totalPrice: 141.98,
      createdAt: abandonedDate,
    },
  });
  console.log('Seeded sample abandoned cart record.');

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
