class CheckoutService {
  constructor(cartUtils, paymentService) {
    this.cartUtils = cartUtils;
    this.paymentService = paymentService;
  }

  async processCheckout(items, paymentInfo) {
    if (this.cartUtils.isCartEmpty(items)) {
      throw new Error('Cart is empty');
    }
    const total = this.cartUtils.calculateTotal(items);
    const totalWithTax = this.cartUtils.applyTax(total);
    const payment = await this.paymentService.charge(totalWithTax, paymentInfo);
    return { success: true, total: totalWithTax, transactionId: payment.id };
  }
}

module.exports = CheckoutService;