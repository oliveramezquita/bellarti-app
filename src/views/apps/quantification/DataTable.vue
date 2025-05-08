<script setup>
const props = defineProps({
  quantification: {
    type: Array,
    required: true,
  },

})

const emit = defineEmits([
  'update:quantification',
])

let extendedHeaders = []

const headers = [
  {
    title: 'CONCEPTO',
    key: 'material.name',
  },
  {
    title: 'UNIDAD DE MEDIDA',
    key: 'material.measurement',
  },
  {
    title: 'CÓDIGO INTERNO',
    key: 'material.internal_code',
  },
]

const setCompleteHeaders = data => {
  let keys = new Set()

  for (const item of data) {
    Object.keys(item).forEach(key => {
      if (key !== "material_id" && key !== "material" && (key === "TOTAL" || key === 'COCINA')) {
        keys.add(key)
      }
    })
  }

  const result = Array.from(keys)

  extendedHeaders = [
    ...headers,
    ...result.map(key => ({ title: key, key })),
  ]
}

setCompleteHeaders(props.quantification)
</script>


<template>
  <VDataTable
    :headers="extendedHeaders"
    :items="props.quantification"
    :items-per-page="5"
    :search="search"
  />
</template>
