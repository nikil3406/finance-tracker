export const RATES = {
  '₹': 1,
  '$': 0.012,
  '€': 0.011,
  '£': 0.0094
};

export function formatValue(val, currency = '₹', raw = false) {
  const rate = RATES[currency] || 1;
  const final = (Number(val) || 0) * rate;
  if (raw) return final;
  return final.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
