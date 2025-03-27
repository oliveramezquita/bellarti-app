import { parse, serialize } from 'cookie-es'

export const useLocalStorage = (name, defaultValue) => {
  let value = localStorage.getItem(name)
  if (value === null) {
    
    value = defaultValue
    localStorage.setItem(name, serialize(name, JSON.stringify(value)))
  }

  return parse(localStorage.getItem(name))
}
