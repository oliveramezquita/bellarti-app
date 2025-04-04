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
  if (typeof(response) === 'object') {
    if (response.hasOwnProperty('message'))
      return response.message

    if (response[0])
      return response[0]

    if (response.hasOwnProperty('error'))
      return response.hasOwnProperty('details') ? `${response.error}, error: ${response.details}` : response.error
  } else if (typeof(response) === 'string') {
    return response
  }
}

const closeNotification = () => {
  emit('update:isNotificationVisible', false)
}
</script>

<template>
  <VSnackbar
    :model-value="props.isNotificationVisible"
    :timeout="-1"
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
