export function formatCurrency(value: number | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatAge(age: number | undefined): string {
  if (typeof age !== 'number') {
    return '—'
  }

  return age === 1 ? '1 year' : `${age} years`
}

export function formatWeight(weight: number | undefined): string {
  if (typeof weight !== 'number') {
    return '—'
  }

  return `${weight.toLocaleString()} kg`
}

export function getProfit(
  purchasePrice: number | undefined,
  sellingPrice: number | undefined,
): number | null {
  if (typeof purchasePrice !== 'number' || typeof sellingPrice !== 'number') {
    return null
  }

  return sellingPrice - purchasePrice
}
