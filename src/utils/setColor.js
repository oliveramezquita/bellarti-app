export const getStatusColor = status => {
  const map = {
    200: 'success',
    201: 'success',
    204: 'warning',
    404: 'warning',
    400: 'error',
    500: 'error',
  }

  return map[status] || 'info'
}
