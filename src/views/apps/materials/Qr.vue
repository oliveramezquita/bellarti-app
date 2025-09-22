<script setup>
const props = defineProps({
  image: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['updateMaterial'])

const updateMaterial = () => {
  emit('updateMaterial')
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
    </div>
  </div>
  <div v-else>
    <div class="d-flex align-center justify-center">
      <VBtn @click="updateMaterial">
        Actualizar material
      </VBtn>
    </div>
  </div>
</template>
