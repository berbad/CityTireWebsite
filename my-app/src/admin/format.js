export const money = cents => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
export const receiptDate = value => new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', dateStyle: 'medium' }).format(new Date(value));
export const receiptTime = value => new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
export function cents(value) {
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(value)) return null;
  const [whole, decimal = ''] = value.split('.');
  return Number(whole) * 100 + Number(decimal.padEnd(2, '0'));
}
export function newDraft(receipt) {
  return {
    receiptId: receipt?.id, expectedRevision: receipt?.revision,
    items: receipt ? receipt.items.map(item => ({ description: item.description, quantity: String(item.quantity), unitPrice: (item.unitPriceCents / 100).toFixed(2) })) : [{ description: '', quantity: '1', unitPrice: '' }],
    customer: { name: receipt?.customer?.name || '', phone: receipt?.customer?.phone || '' },
    customerOpen: Boolean(receipt?.customer?.name || receipt?.customer?.phone), pending: null, saved: null, dirty: false,
  };
}
