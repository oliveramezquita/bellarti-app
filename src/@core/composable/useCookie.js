// Ported from [Nuxt](https://github.com/nuxt/nuxt/blob/main/packages/nuxt/src/app/composables/cookie.ts)
import { parse, serialize } from 'cookie-es'
import { destr } from 'destr'
 
const CookieDefaults = {
  path: '/',
  watch: true,
  decode: val => destr(decodeURIComponent(val)),
  encode: val => encodeURIComponent(typeof val === 'string' ? val : JSON.stringify(val)),
}

export const useCookie = (name, _opts) => {
  const opts = { ...CookieDefaults, ..._opts || {} }
  const cookies = parse(document.cookie, opts)
  const cookie = ref(cookies[name] ?? opts.default?.())

  watch(cookie, () => {
    document.cookie = serializeCookie(name, cookie.value, opts)
  })
  
  return cookie
}
function serializeCookie(name, value, opts = {}) {
  if (value === null || value === undefined)
    return serialize(name, value, { ...opts, maxAge: -1 })
  
  return serialize(name, value, { ...opts, maxAge: 60 * 60 * 24 * 30 })
}

export const saveStoragePermissions = permissions => {
  const encryptedPermissions = btoa(JSON.stringify(permissions))

  localStorage.setItem('userAbilityRules', encryptedPermissions)
}

export const extractStoragePermissions = () => {
  const encryptedPermissions = localStorage.getItem('userAbilityRules')
  if (!encryptedPermissions) {
    return null
  }

  // Desencriptar los permisos
  const decryptedPermissions = JSON.parse(atob(encryptedPermissions))

  // Crear un proxy para el array de permisos
  return new Proxy(decryptedPermissions, {
    get(target, prop) {
      if (prop in target) {
        return target[prop]
      }
      
      return undefined
    },
    set(target, prop, value) {
      if (typeof prop === 'string' && !isNaN(prop)) {
        target[prop] = value
        
        return true
      }
      
      return false
    },
  })
}
