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
  color: {
    type: String,
    required: false,
    default: 'default',
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
    :color="props.color"
  >
    {{ parseResponse(props.message) }}
    <template #actions>
      <VBtn
        color="default"
        @click="closeNotification"
      >
        Cerrar
      </VBtn>
    </template>
  </VSnackbar>
</template>
