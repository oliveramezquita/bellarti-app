<script setup>
const props = defineProps({
  isNotificationVisible: {
    type: Boolean,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:isNotificationVisible'])

const parseResponse = response => {
  if (typeof(response) === 'object')
    return response[0]
  else if (typeof(response) === 'string')
    return response
}

const closeNotification = () => {
  emit('update:isNotificationVisible', false)
}
</script>

<template>
  <VSnackbar
    :model-value="props.isNotificationVisible"
    multi-line
  >
    {{ parseResponse(props.message) }}
    <template #actions>
      <VBtn
        color="error"
        @click="closeNotification"
      >
        Cerrar
      </VBtn>
    </template>
  </VSnackbar>
</template>
