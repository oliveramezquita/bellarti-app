<script setup>
const props = defineProps({
  image: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['createQrCode', 'deleteQrCode'])

const createQrCode = () => {
  emit('createQrCode')
}

const deleteQrCode = () => {
  emit('deleteQrCode')
}
</script>

<template>
  <div v-if="props.image">
    <div class="d-flex align-center justify-center">
      <VImg
        :src="image"
        max-width="250"
        max-height="250"
        contain
        class="mb-4"
      />
    </div>
    <div class="d-flex align-center justify-center">
      <VBtn>
        Imprimir
      </VBtn>
      <VBtn
        class="ml-4"
        variant="outlined"
        @click="deleteQrCode"
      >
        Eliminar
      </VBtn>
    </div>
  </div>
  <div v-else>
    <div class="d-flex align-center justify-center">
      <VBtn @click="createQrCode">
        Crear un código QR
      </VBtn>
    </div>
  </div>
</template>
