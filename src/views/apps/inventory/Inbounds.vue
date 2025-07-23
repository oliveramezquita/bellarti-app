<!-- eslint-disable camelcase -->
<script setup>
const props = defineProps({
  materialId: {
    type: String,
    required: true,
  },

})

const emit = defineEmits([
  'update:materialId',
])

const createdAtDate = ref('')

const {
  data: ibounds,
  execute: fetcInbounds,
} = await useApi(createUrl(`api/inbounds/material/${ props.materialId }`, {
  query: {
    created_at: createdAtDate,
  },
}))

const headers = [
  {
    title: 'Rack',
    key: 'rack',
  },
  {
    title: 'Nivel',
    key: 'level',
  },
  {
    title: 'Módulo',
    key: 'module',
  },
  {
    title: 'Cantidad',
    key: 'quantity',
  },
  {
    title: 'Proyecto',
    key: 'project.name',
  },
  {
    title: 'Fecha',
    key: 'created_at',
  },
  {
    title: '',
    key: 'actions',
    sortable: false, 
  },
]

// watch(createdAtDate, newDate => {
//   console.log(newDate)
// })

// const deleteMaterial = id => {
//   emit('volumetryData', id)
// }
</script>

<template>
  <div
    class="d-flex flex-wrap align-center"
    style="justify-content: space-between;"
  >
    <!-- 👉 Search  -->
    <AppDateTimePicker
      v-model="createdAtDate"
      label="Buscar por fecha"
      :config="{ mode: 'range' }"
      style="inline-size: 15.625rem;"
    />
    <AppTextField
      v-model="total"
      label="Total"
      placeholder="Total"
      readonly
      class="ml-3"
      style="inline-size: 15.625rem;"
    />
  </div>
  <VDataTable
    :headers="headers"
    :items="ibounds"
    :items-per-page="10"
    :search="search"
  >
    <!-- 👉 Created at -->
    <template #item.created_at="{ item }">
      {{ formatDate(item.created_at) }}
    </template>
    <!-- Actions -->
    <template #item.actions="{ item }">
      <IconBtn @click="deleteInbound(item)">
        <VIcon icon="tabler-trash" />
      </IconBtn>
    </template>
  </VDataTable>
</template>
