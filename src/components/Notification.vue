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

const parseReponse = response => {
  if (typeof(response) === 'object')
    return response[0]
  else if (typeof(response) === 'string')
    return response
}
</script>

<template>
  <VSnackbar
    :model-value="props.isNotificationVisible"
    :timeout="3000"
  >
    {{ parseReponse(props.message) }}
  </VSnackbar>
</template>
