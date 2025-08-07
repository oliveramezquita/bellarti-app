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
  'deleteInbound',
])

const createdAtDate = ref('')
const total = ref(0)

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

const deleteInbound = id => {
  emit('deleteInbound', id)
}

const getTotal = () => {
  total.value = ibounds.value.reduce((sum, item) => sum + item.quantity, 0)
}

getTotal()

watch(ibounds, _ => {
  getTotal()
})
</script>

<template>
  <div
    class="d-flex align-center justify-space-between"
    style="padding: 24px;"
  >
    <!-- 👉 Search  -->
    <AppDateTimePicker
      v-model="createdAtDate"
      label="Buscar por fecha"
      :config="{ mode: 'range' }"
      style="inline-size: 15.625rem;"
    />
    <div>
      <AppTextField
        v-model="total"
        label="Total"
        placeholder="Total"
        readonly
        class="ml-3"
        style="inline-size: 15.625rem;"
      />
    </div>
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
