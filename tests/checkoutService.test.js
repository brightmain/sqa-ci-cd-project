const CheckoutService = require('../src/checkoutService');
const CartUtils = require('../src/cartUtils');

jest.mock('../src/cartUtils');

describe('CheckoutService Integration', () => {
  let service, mockCart, mockPayment;

  beforeEach(() => {
    mockCart = new CartUtils();
    mockPayment = { charge: jest.fn() };
    service = new CheckoutService(mockCart, mockPayment);
  });

  test('checkout berhasil dengan cart valid', async () => {
    mockCart.isCartEmpty.mockReturnValue(false);
    mockCart.calculateTotal.mockReturnValue(100);
    mockCart.applyTax.mockReturnValue(110);
    mockPayment.charge.mockResolvedValue({ id: 'TX-001' });

    const result = await service.processCheckout([{ price: 100 }], { card: '1234' });
    expect(result.success).toBe(true);
    expect(result.total).toBe(110);
  });

  test('checkout gagal jika cart kosong', async () => {
    mockCart.isCartEmpty.mockReturnValue(true);
    await expect(service.processCheckout([], {})).rejects.toThrow('Cart is empty');
  });

  test('payment dipanggil dengan total yang benar', async () => {
    mockCart.isCartEmpty.mockReturnValue(false);
    mockCart.calculateTotal.mockReturnValue(50);
    mockCart.applyTax.mockReturnValue(55);
    mockPayment.charge.mockResolvedValue({ id: 'TX-002' });

    await service.processCheckout([{ price: 50 }], { card: '1234' });
    expect(mockPayment.charge).toHaveBeenCalledWith(55, { card: '1234' });
  });

  test('checkout gagal jika payment error', async () => {
    mockCart.isCartEmpty.mockReturnValue(false);
    mockCart.calculateTotal.mockReturnValue(100);
    mockCart.applyTax.mockReturnValue(110);
    mockPayment.charge.mockRejectedValue(new Error('Payment failed'));

    await expect(service.processCheckout([{ price: 100 }], {}))
      .rejects.toThrow('Payment failed');
  });

  test('transaction ID dikembalikan dengan benar', async () => {
    mockCart.isCartEmpty.mockReturnValue(false);
    mockCart.calculateTotal.mockReturnValue(10);
    mockCart.applyTax.mockReturnValue(11);
    mockPayment.charge.mockResolvedValue({ id: 'TX-999' });

    const result = await service.processCheckout([{ price: 10 }], {});
    expect(result.transactionId).toBe('TX-999');
  });
});