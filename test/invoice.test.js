'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function line(id, name, hsn, price, qty, gstRate) {
  return { id, name, sku: 'SKU-' + id, hsn, price, qty, gstRate };
}

function assertFigures(order, expectedInvoice, expectedPricing) {
  const invoiceFigures = invoice.computeInvoiceFigures(order);
  const checkoutFigures = pricing.computeTotals(order.items, order.coupon);

  assert.deepStrictEqual({
    subtotal: invoiceFigures.subtotal,
    discount: invoiceFigures.discount,
    tax: invoiceFigures.tax,
    cgst: invoiceFigures.cgst,
    sgst: invoiceFigures.sgst,
    total: invoiceFigures.total,
    rows: invoiceFigures.rows.map(({ hsn, gstPercent, line, lineTax }) => ({ hsn, gstPercent, line, lineTax }))
  }, expectedInvoice);

  assert.deepStrictEqual({
    subtotal: checkoutFigures.subtotal,
    discount: checkoutFigures.discount,
    tax: checkoutFigures.tax,
    cgst: checkoutFigures.cgst,
    sgst: checkoutFigures.sgst,
    total: checkoutFigures.total
  }, expectedPricing);
}

test('CURRENT BEHAVIOUR: order #1001 style mixed 5% and 12% basket without coupon', () => {
  const order = {
    id: 1001,
    coupon: '',
    items: [
      line(1, 'Indrayani Basmati Rice 5kg', '1006', 640, 1, 5),
      line(7, 'Pasteurized Table Butter 500g', '0405', 260, 1, 12)
    ]
  };

  assertFigures(order,
    {
      subtotal: 900, discount: 0, tax: 63.2, cgst: 31.6, sgst: 31.6, total: 963.2,
      rows: [
        { hsn: '1006', gstPercent: 5, line: 640, lineTax: 32 },
        { hsn: '0405', gstPercent: 12, line: 260, lineTax: 31.2 }
      ]
    },
    { subtotal: 900, discount: 0, tax: 63.2, cgst: 31.6, sgst: 31.6, total: 963.2 }
  );
});

test('Invoice matches checkout for order #1002 style SAVE10 coupon', () => {
  const order = {
    id: 1002,
    coupon: 'SAVE10',
    items: [
      line(1, 'Indrayani Basmati Rice 5kg', '1006', 640, 1, 5),
      line(4, 'Cold-Pressed Sunflower Oil 1L', '1512', 190, 2, 5)
    ]
  };

  assertFigures(order,
    {
      subtotal: 1020, discount: 102, tax: 45.9, cgst: 22.95, sgst: 22.95, total: 963.9,
      rows: [
        { hsn: '1006', gstPercent: 5, line: 640, lineTax: 28.8 },
        { hsn: '1512', gstPercent: 5, line: 380, lineTax: 17.1 }
      ]
    },
    { subtotal: 1020, discount: 102, tax: 45.9, cgst: 22.95, sgst: 22.95, total: 963.9 }
  );
});

test('Invoice matches checkout for order #1004 style SAVE10 coupon cap', () => {
  const order = {
    id: 1004,
    coupon: 'SAVE10',
    items: [line(5, 'Cold-Pressed Groundnut Oil 5L', '1508', 1120, 2, 5)]
  };

  assertFigures(order,
    {
      subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5,
      rows: [{ hsn: '1508', gstPercent: 5, line: 2240, lineTax: 104.5 }]
    },
    { subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5 }
  );
});

test('Invoice matches checkout HSN GST and capped pre-tax SAVE10 for order #1004', () => {
  const order = {
    id: 1004,
    coupon: 'SAVE10',
    items: [line(5, 'Cold-Pressed Groundnut Oil 5L', '1508', 1120, 2)]
  };
  const checkoutFigures = pricing.computeTotals(order.items, order.coupon);
  const invoiceFigures = invoice.computeInvoiceFigures(order);

  assert.deepStrictEqual({
    subtotal: invoiceFigures.subtotal,
    discount: invoiceFigures.discount,
    tax: invoiceFigures.tax,
    cgst: invoiceFigures.cgst,
    sgst: invoiceFigures.sgst,
    total: invoiceFigures.total,
    rows: invoiceFigures.rows.map(({ hsn, gstPercent, lineTax }) => ({ hsn, gstPercent, lineTax }))
  }, {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5,
    rows: [{ hsn: '1508', gstPercent: 5, lineTax: 104.5 }]
  });
  assert.deepStrictEqual({
    subtotal: invoiceFigures.subtotal,
    discount: invoiceFigures.discount,
    tax: invoiceFigures.tax,
    cgst: invoiceFigures.cgst,
    sgst: invoiceFigures.sgst,
    total: invoiceFigures.total
  }, {
    subtotal: checkoutFigures.subtotal,
    discount: checkoutFigures.discount,
    tax: checkoutFigures.tax,
    cgst: checkoutFigures.cgst,
    sgst: checkoutFigures.sgst,
    total: checkoutFigures.total
  });
});

test('CURRENT BEHAVIOUR: order #1008 style all-18% basket without coupon', () => {
  const order = {
    id: 1008,
    coupon: '',
    items: [
      line(8, 'Assam CTC Masala Chai 250g', '0902', 140, 1, 18),
      line(12, 'Kokum Sherbet Concentrate 750ml', '2106', 180, 2, 18)
    ]
  };

  assertFigures(order,
    {
      subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590,
      rows: [
        { hsn: '0902', gstPercent: 18, line: 140, lineTax: 25.2 },
        { hsn: '2106', gstPercent: 18, line: 360, lineTax: 64.8 }
      ]
    },
    { subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590 }
  );
});
