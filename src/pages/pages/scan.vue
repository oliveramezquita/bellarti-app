<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Scan',
  },
})
import { ref, watchEffect } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'

const paused = ref(false)
const result = ref('')
const error = ref(null)

function onDecode(content) {
  result.value = content

  // Opcional: detener escaneo automático al obtener resultado
  paused.value = true
}

function onInit(promise) {
  promise.catch(err => {
    error.value = err.message
  })
}

function onError(err) {
  error.value = err.message
}

function togglePaused() {
  paused.value = !paused.value
}

watchEffect(() => {
  console.log('paused is', paused.value)
})
</script>

<template>
  <div class="d-flex align-center flex-wrap">
    <VContainer>
      <QrcodeStream
        :paused="paused"
        @decode="onDecode"
        @init="onInit"
        @error="onError"
      />

      <VBtn
        class="mt-4"
        @click="togglePaused"
      >
        {{ paused ? 'Reanudar escaneo' : 'Pausar escaneo' }}
      </VBtn>

      <VAlert
        v-if="result"
        type="success"
        class="mt-4"
      >
        Resultado: {{ result }}
      </VAlert>

      <VAlert
        v-if="error"
        type="error"
        class="mt-2"
      >
        Error: {{ error }}
      </VAlert>
    </VContainer>
  </div>
</template>
