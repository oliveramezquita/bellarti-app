<script setup>
import { BrowserMultiFormatReader } from '@zxing/browser'
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'update:isDialogVisible',
  'barcodeDetected',
])

const videoRef = ref(null)
const stream = ref(null)

const codeReader = new BrowserMultiFormatReader()

let scanning = false

const startScanner = async () => {
  try {
    await nextTick()

    scanning = true

    const devices = await BrowserMultiFormatReader.listVideoInputDevices()

    const preferredCamera = devices.find(device =>
      device.label.toLowerCase().includes('usb')
      || device.label.toLowerCase().includes('back')
      || device.label.toLowerCase().includes('rear'),
    )

    const selectedDeviceId =
      preferredCamera?.deviceId || devices[0]?.deviceId

    stream.value = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: selectedDeviceId
          ? { exact: selectedDeviceId }
          : undefined,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    })

    videoRef.value.srcObject = stream.value

    await videoRef.value.play()

    scanLoop(selectedDeviceId)
  }
  catch (err) {
    console.error('Error al abrir cámara:', err)
  }
}

const scanLoop = async deviceId => {
  while (scanning) {
    try {
      const result = await codeReader.decodeOnceFromVideoDevice(
        deviceId,
        videoRef.value,
      )

      if (result) {
        emit('barcodeDetected', result.getText())

        closeScanner()

        break
      }
    }
    catch {
      // Ignorar completamente errores de detección
    }

    // Pequeña pausa
    await new Promise(resolve => setTimeout(resolve, 200))
  }
}

const closeScanner = () => {
  scanning = false

  try {
    codeReader.reset()
  }
  catch {
    // ignorar
  }

  try {
    if (stream.value) {
      stream.value.getTracks().forEach(track => {
        track.stop()
      })

      stream.value = null
    }

    if (videoRef.value) {
      videoRef.value.pause()
      videoRef.value.srcObject = null
    }
  }
  catch (err) {
    console.warn(err)
  }

  emit('update:isDialogVisible', false)
}

watch(
  () => props.isDialogVisible,
  value => {
    if (value)
      startScanner()
    else
      closeScanner()
  },
)

onBeforeUnmount(() => {
  closeScanner()
})
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 700"
    :model-value="props.isDialogVisible"
    persistent
  >
    <VCard>
      <VCardTitle>
        Escanear código de barras
      </VCardTitle>

      <VCardText>
        <div class="scanner-container">
          <video
            ref="videoRef"
            autoplay
            muted
            playsinline
            class="scanner-video"
          />

          <!-- Overlay -->
          <div class="scanner-overlay">
            <div class="scanner-box">
              <div class="scanner-line" />
            </div>
          </div>
        </div>
      </VCardText>

      <VCardActions>
        <VSpacer />

        <VBtn
          color="error"
          variant="text"
          @click="closeScanner"
        >
          Cancelar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.scanner-container {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: black;
}

.scanner-video {
  display: block;
  inline-size: 100%;
}

.scanner-overlay {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  inset: 0;
  pointer-events: none;
}

.scanner-box {
  position: relative;
  overflow: hidden;
  border: 3px solid white;
  border-radius: 12px;
  block-size: 140px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 45%);
  inline-size: 85%;
}

/* Línea roja animada */
.scanner-line {
  position: absolute;
  animation: scan 2s linear infinite;
  background: red;
  block-size: 3px;
  box-shadow: 0 0 12px red;
  inline-size: 100%;
  inset-inline-start: 0;
}

@keyframes scan {
  0% {
    inset-block-start: 0;
  }

  50% {
    inset-block-start: calc(100% - 3px);
  }

  100% {
    inset-block-start: 0;
  }
}
</style>
