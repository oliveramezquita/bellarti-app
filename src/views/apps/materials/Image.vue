<script setup>
const props = defineProps({
  materialId: {
    type: String,
    required: true,
  },
  images: {
    type: Object,
    required: false,
    default: () => ({}),
  },
})

const emit = defineEmits([
  'update:materialId',
  'update:images',
  'uploadImage',
  'deleteImages',
])

const image = ref()
const images = ref(structuredClone(toRaw(props.images)))

let checkboxContent = ref(Object.entries(images.value).map(([key, url]) => ({
  bgImage: url,
  value: Number(key),
})))

const selectedCheckbox = ref([])

const uploadImage = () => {
  const formData = new FormData()

  formData.append('image', image.value)
  emit('uploadImage', formData)
}

const deleteImages = () => {
  emit('deleteImages', Object.values(selectedCheckbox.value))
  nextTick(() => {
    selectedCheckbox.value = []
  })
}

watch(() => props.images, newValue => {
  checkboxContent.value = Object.entries(newValue).map(([key, url]) => ({
    bgImage: url,
    value: Number(key),
  }))
})
</script>

<template>
  <p>
    Para cargar imagenes deben ser en formato: JPEG o PNG.
  </p>
  <VRow>
    <VCol
      cols="12"
      md="9"
    >
      <VFileInput
        v-model="image"
        label="Sube tu imagen"
        accept="image/png, image/jpeg"
        prepend-icon="tabler-photo-plus"
        outlined
        dense
        required
      />
    </VCol>
    <VCol
      cols="12"
      md="3"
    >
      <VBtn
        color="primary"
        :disabled="image ? false : true"
        @click="uploadImage"
      >
        Subir imagen
      </VBtn>
    </VCol>
    <VCol cols="12">
      <CustomCheckboxesWithImage
        v-model:selected-checkbox="selectedCheckbox"
        :checkbox-content="checkboxContent"
        :grid-column="{ sm: '6', cols: '12' }"
      />
    </VCol>
    <VCol cols="12">
      <VBtn
        v-if="checkboxContent.length > 0"
        :disabled="Object.keys(selectedCheckbox).length > 0 ? false : true"
        @click="deleteImages"
      >
        Eliminar
      </VBtn>
    </VCol>
  </VRow>
</template>
