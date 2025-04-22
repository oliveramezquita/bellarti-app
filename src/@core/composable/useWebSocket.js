// src/composables/useWebSocket.js
import { onBeforeUnmount, ref } from 'vue'

export function useWebSocket(onMessageCallback) {
  const url = import.meta.env.VITE_WS
  const messages = ref([])
  let socket = null

  const connect = () => {
    socket = new WebSocket(url)

    socket.onmessage = event => {
      const data = JSON.parse(event.data)

      messages.value.push(data)
      console.log('📨 Nueva notificación:', data)

      if (data.hasOwnProperty('notification') && onMessageCallback) {
        onMessageCallback(data)
      }
    }

    socket.onerror = e => console.error('WebSocket error', e)

    socket.onclose = () => {
      console.warn('🔌 WebSocket cerrado. Reintentando...')
      setTimeout(connect, 3000)
    }
  }

  connect()

  onBeforeUnmount(() => {
    if (socket) socket.close()
  })

  return {
    messages,
  }
}
