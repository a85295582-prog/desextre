export function formatPrice(price: number): string {
  const rounded = Math.round(price);
  const formatted = rounded.toLocaleString('es-PY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `₲ ${formatted}`;
}
