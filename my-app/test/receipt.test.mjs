import test from 'node:test';
import assert from 'node:assert/strict';

// Exercise real jsPDF serialization, not a mock of the library.
test('receipt generates a PDF with business details, date and positive service counts', async () => {
  const { createReceipt } = await import('../src/Utils/receipt.mjs');
  const pdf = createReceipt({newTires: 2, usedTires: '', brakes: 0, rotation: -1, balance: 3, plugging: 1}, '9/14/2026').output();
  assert.ok(pdf.startsWith('%PDF-'));
  for (const text of ['City Tire Repair Shop', '5112 N Lincoln Ave', 'Date: 9/14/2026', 'New tires: 2', 'Balance: 3', 'Plugging: 1']) assert.ok(pdf.includes(text), text);
  for (const text of ['Used tires:', 'Brakes:', 'Rotation:']) assert.ok(!pdf.includes(text), text);
});

test('receipt treats supplied date as PDF text, not executable HTML or PDF commands', async () => {
  const { createReceipt } = await import('../src/Utils/receipt.mjs');
  const pdf = createReceipt({}, '<script>alert(1)</script> (test)').output();
  assert.ok(pdf.includes('alert\\(1\\)'));
  assert.ok(!pdf.includes('/JavaScript'));
  assert.ok(!pdf.includes('/OpenAction <<'));
});
