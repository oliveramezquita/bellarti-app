// ✅ Helpers de persistencia
export const saveState = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn(`Error al guardar ${key} en localStorage:`, e)
  }
}

export const loadState = key => {
  try {
    const item = localStorage.getItem(key)
    
    return item ? JSON.parse(item) : null
  } catch (e) {
    console.warn(`Error al cargar ${key} desde localStorage:`, e)
    
    return null
  }
}
