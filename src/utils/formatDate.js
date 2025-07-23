export const formatDate = fechaISO => {
  if (fechaISO) {
    const date = new Date(fechaISO)
  
    const day = String(date.getUTCDate()).padStart(2, '0')
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const monthAbbrev = months[date.getUTCMonth()]
    const year = String(date.getUTCFullYear()).slice(-2)

    return `${day}/${monthAbbrev}/${year}`
  } else {
    return ''
  }
}
