<script setup>
import { computed, ref, toRaw, watch } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: null,
  },
  options: {
    type: Array,
    required: true,
  },
  optionValue: {
    type: String,
    default: null,
  },
  rules: {
    type: Array,
    default: () => ([]),
  },
})

const emit = defineEmits([
  'optionData',   // ÚNICO evento realmente usado
])

// ---------------------------------------------
// STATE
// ---------------------------------------------

// Clonamos las opciones y agregamos "Agregar nueva"
const options = ref(structuredClone(toRaw(props.options)))

options.value.push('Agregar una nueva opción')

// Valor inicial de la opción seleccionada
const option = ref(structuredClone(props.optionValue))

// Campo de nueva opción
const newOption = ref(null)

// Placeholder reactivo
const placeholder = computed(() => props.placeholder ?? props.label)

// ---------------------------------------------
// METHODS
// ---------------------------------------------

const handleChange = () => {
  // Si no está en "Agregar una nueva opción", limpiamos el campo newOption
  if (option.value !== 'Agregar una nueva opción')
    newOption.value = null

  emit('optionData', {
    option: option.value,
    newOption: newOption.value,
  })
}

// ---------------------------------------------
// WATCHERS
// ---------------------------------------------

watch(
  () => props.options,
  newValue => {
    options.value = structuredClone(toRaw(newValue))
    options.value.push('Agregar una nueva opción')
  },
)

watch(
  () => props.optionValue,
  newValue => {
    option.value = structuredClone(newValue)
  },
)
</script>

<template>
  <AppSelect
    v-model="option"
    :items="options"
    :rules="props.rules"
    :label="props.label"
    :placeholder="placeholder"
    @update:model-value="handleChange"
  />

  <!-- Campo visible solo al agregar una nueva opción -->
  <AppTextField
    v-if="option === 'Agregar una nueva opción'"
    v-model="newOption"
    :rules="props.rules"
    placeholder="Nueva opción"
    class="mt-2"
    @blur="handleChange"
  />
</template>
