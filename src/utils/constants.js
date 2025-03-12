export const COOKIE_MAX_AGE_1_YEAR = 365 * 24 * 60 * 60
export const USER_STATUS = [
  {
    title: 'Pendiente',
    value: 0,
  },
  {
    title: 'Activo',
    value: 1,
  },
  {
    title: 'Inactivo',
    value: 2,
  },
]
export const COMMON_STATUS = [
  {
    title: 'Activado',
    value: 1,
  },
  {
    title: 'Desactivado',
    value: 0,
  },
]
export const USER_ROLE_VARIANT = role => {
  const roleLowerCase = role.toLowerCase()
  if (roleLowerCase === 'ceo')
    return {
      color: 'success',
      icon: 'tabler-user-star',
    }
  if (roleLowerCase === 'coo')
    return {
      color: 'warning',
      icon: 'tabler-user-cog',
    }
  if (roleLowerCase === 'cfo' || roleLowerCase === 'cop')
    return {
      color: 'info',
      icon: 'tabler-user-dollar',
    }
  if (roleLowerCase === 'storer')
    return {
      color: 'grey-900',
      icon: 'tabler-package',
    }
  if (roleLowerCase === 'design')
    return {
      color: 'on-background',
      icon: 'tabler-user-edit',
    }
  if (roleLowerCase === 'rh')
    return {
      color: 'error',
      icon: 'tabler-user-heart',
    }
  if (roleLowerCase === 'admin')
    return {
      color: 'primary',
      icon: 'tabler-crown',
    }
    
  return {
    color: 'primary',
    icon: 'tabler-user',
  }
}
