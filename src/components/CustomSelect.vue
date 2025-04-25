<script setup>
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
  rules: {
    type: Array,
    required: false,
    default: () => ([]),
  },
})

const emit = defineEmits([
  'update:label',
  'update:options',
  'update:rule',
  'optionData',
])

const options = ref(structuredClone(toRaw(props.options)))
const option = ref()
const newOption = ref(null)

options.value.push('Agregar una nueva opción')

const handleChange = () => {
  if (option.value !== 'Agregar una nueva opción')
    newOption.value = null
  emit('optionData', { option: option.value, newOption: newOption.value })
}

watch(() => props.options, newValue => {
  options.value = structuredClone(toRaw(newValue))
  options.value.push('Agregar una nueva opción')
})
</script>

<template>
  <AppSelect
    v-model="option"
    :items="options"
    :rules="props.rules"
    :label="props.label"
    :placeholder="props.label"
    @update:model-value="handleChange"
  />
  <AppTextField
    v-if="option === 'Agregar una nueva opción'"
    v-model="newOption"
    :rules="props.rules"
    placeholder="Nueva opción"
    class="mt-2"
    @blur="handleChange"
  />
</template>
