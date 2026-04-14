export const formatCurrency = value => {
  const number = Number(value)

  if (isNaN(number)) return ''

  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number)
}
