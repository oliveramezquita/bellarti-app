export const formatNumber = (value, locale = 'en-US', decimals = 2) => {
  if (value === null || value === undefined || value === '' || isNaN(Number(value)))
    return null

  return Number(value).toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
