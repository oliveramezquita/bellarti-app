<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  return: {
    type: Boolean,
    required: false,
    default: true,
  },
  go: {
    type: String,
    required: false,
  },
})
 
const icon = ref(`tabler-${props.icon}`)
const router = useRouter()

const goBack = () => {
  if (props.go)
    router.replace(props.go)
  else
    router.go(-1)
}
</script>

<template>
  <VCard class="mb-2">
    <VCardText class="d-flex align-center justify-space-between py-4">
      <VBreadcrumbs
        class="px-0 pb-0 pt-0 help-center-breadcrumbs"
        :items="props.items"
      >
        <template #prepend>
          <VIcon
            :icon="icon"
            size="small"
          />
        </template>
      </VBreadcrumbs>
      <VBtn
        v-if="props.return"
        color="secondary"
        variant="tonal"
        @click="goBack"
      >
        <VIcon
          start
          icon="tabler-arrow-left"
        />
        Regresar
      </VBtn>
    </VCardText>
  </VCard>
</template>
