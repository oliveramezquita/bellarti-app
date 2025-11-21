export default {
  mounted(el) {
    // Buscar el input interno o usar el propio elemento
    const input = el.querySelector('input') || el

    if (!input) return

    input.addEventListener('focus', () => {
      // Usar setTimeout evita conflictos con Vuetify que enfoca después del click
      setTimeout(() => {
        input.select()
      }, 0)
    })
  },
}
