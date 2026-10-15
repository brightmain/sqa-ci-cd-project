const CartUtils = require('../src/cartUtils');

describe('CartUtils', () => {
  let cart;
  beforeEach(() => { cart = new CartUtils(); });

  describe('calculateTotal', () => {
    test('total untuk 1 item', () => {
      expect(cart.calculateTotal([{ price: 10 }])).toBe(10);
    });
    test('total untuk multiple items', () => {
      expect(cart.calculateTotal([{ price: 10 }, { price: 20 }])).toBe(30);
    });
    test('total untuk cart kosong', () => {
      expect(cart.calculateTotal([])).toBe(0);
    });
    test('total untuk null', () => {
      expect(cart.calculateTotal(null)).toBe(0);
    });
    test('test sengaja gagal', () => {
  expect(2 + 2).toBe(5);
});
  });

  describe('applyTax', () => {
    test('tax default 10%', () => {
  expect(cart.applyTax(100)).toBeCloseTo(110, 2);
});
test('tax custom 20%', () => {
  expect(cart.applyTax(100, 0.2)).toBeCloseTo(120, 2);
});
    test('tax untuk total negatif throw error', () => {
      expect(() => cart.applyTax(-10)).toThrow('Total cannot be negative');
    });
  });

  describe('formatCurrency', () => {
    test('format 10 menjadi $10.00', () => {
      expect(cart.formatCurrency(10)).toBe('$10.00');
    });
    test('format 10.5 menjadi $10.50', () => {
      expect(cart.formatCurrency(10.5)).toBe('$10.50');
    });
    test('format 0 menjadi $0.00', () => {
      expect(cart.formatCurrency(0)).toBe('$0.00');
    });
    test('format non-number throw error', () => {
      expect(() => cart.formatCurrency('abc')).toThrow();
    });
  });

  describe('isCartEmpty', () => {
    test('cart kosong return true', () => {
      expect(cart.isCartEmpty([])).toBe(true);
    });
    test('cart null return true', () => {
      expect(cart.isCartEmpty(null)).toBe(true);
    });
    test('cart berisi return false', () => {
      expect(cart.isCartEmpty([{ price: 10 }])).toBe(false);
    });
  });

  describe('countItems', () => {
    test('hitung 3 items', () => {
      expect(cart.countItems([1, 2, 3])).toBe(3);
    });
    test('hitung null', () => {
      expect(cart.countItems(null)).toBe(0);
    });
  });
});