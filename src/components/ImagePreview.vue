<script setup>
const props = defineProps({
  image: {
    type: String,
    default: null,
  },
  title: {
    type: String,
    required: true,
  },
})

const showImageDialog = ref(false)

const openImage = () => {
  showImageDialog.value = true
}
</script>

<template>
  <div class="d-flex align-center justify-center">
    <div>
      <VImg
        v-if="image"
        :src="image"
        height="50"
        width="50"
        class="cursor-pointer"
        @click="openImage"
      />

      <VSheet
        v-else
        width="40"
        height="40"
        color="grey-lighten-2"
        class="d-flex align-center justify-center"
        rounded
      >
        <VIcon
          icon="tabler-photo"
          color="primary"
        />
      </VSheet>
    </div>
  </div>

  <VDialog
    v-model="showImageDialog"
    max-width="800"
  >
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        {{ title }}

        <VBtn
          icon="tabler-x"
          variant="text"
          @click="showImageDialog = false"
        />
      </VCardTitle>

      <VCardText class="d-flex justify-center">
        <VImg
          :src="image"
          max-height="700"
          max-width="750"
          contain
        />
      </VCardText>
    </VCard>
  </VDialog>
</template>
