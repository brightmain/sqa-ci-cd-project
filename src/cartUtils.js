class CartUtils {
  calculateTotal(items) {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + item.price, 0);
  }

  applyTax(total, taxRate = 0.1) {
  if (total < 0) throw new Error('Total cannot be negative');
  return Number((total * (1 + taxRate)).toFixed(2));
}

  formatCurrency(amount) {
    if (typeof amount !== 'number') throw new Error('Amount must be a number');
    return `$${amount.toFixed(2)}`;
  }

  isCartEmpty(items) {
    return !items || items.length === 0;
  }

  countItems(items) {
    return items ? items.length : 0;
  }
}

module.exports = CartUtils;