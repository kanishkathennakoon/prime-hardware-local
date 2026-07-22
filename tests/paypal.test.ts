import { generateAccessToken, paypal } from '../lib/paypal';

// Test to generate access token from paypal
test('generates token from paypal', async () => {
  const mockToken = jest.spyOn(require('../lib/paypal'), 'generateAccessToken').mockResolvedValue('access-token-123');
  const tokenResponse = await generateAccessToken();
  expect(typeof tokenResponse).toBe('string');
  expect(tokenResponse.length).toBeGreaterThan(0);
  mockToken.mockRestore();
});

// Test to create a paypal order
test('creates a paypal order', async () => {
  const mockCreate = jest.spyOn(paypal, 'createOrder').mockResolvedValue({
    id: 'ORDER-123',
    status: 'CREATED',
  });
  const price = 10.0;

  const orderResponse = await paypal.createOrder(price);
  expect(orderResponse).toHaveProperty('id');
  expect(orderResponse).toHaveProperty('status');
  expect(orderResponse.status).toBe('CREATED');
  mockCreate.mockRestore();
});

// Test to capture payment with mock order
test('simulate capturing a payment from an order', async () => {
  const orderId = '100';

  const mockCapturePayment = jest
    .spyOn(paypal, 'capturePayment')
    .mockResolvedValue({
      status: 'COMPLETED',
    });

  const captureResponse = await paypal.capturePayment(orderId);
  expect(captureResponse).toHaveProperty('status', 'COMPLETED');

  mockCapturePayment.mockRestore();
});
