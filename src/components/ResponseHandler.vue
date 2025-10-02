<script setup>
const props = defineProps({
  isAlertVisible: {
    type: Boolean,
    required: true,
  },
  response: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:isAlertVisible'])

const alertVisibleUpdate = val => {
  emit('update:isAlertVisible', val)
}

const typeAlert = status => {
  if (status === 200 || status === 201) 
    return 'success'
  else if (status === 400 || status === 404)
    return 'warning'
  else
    return 'error'
}

const parseResponse = response => {
  if (typeof(response) === 'object')
    
    return response.hasOwnProperty('error') ? response.error : response[0]
  else if (typeof(response) === 'string')
    return response
}
</script>

<template>
  <VAlert
    v-if="props.response"
    :model-value="props.isAlertVisible"
    :type="typeAlert(props.response.status)"
    closable
    class="mt-5"
    @update:model-value="alertVisibleUpdate"
  >
    {{ parseResponse(response._data) }}
  </VAlert>
</template>


