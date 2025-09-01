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
const total = ref(0)

const {
  data: inbounds,
} = await useApi(createUrl(`api/inbounds/material/${ props.materialId }`, {
  query: {
    created_at: createdAtDate,
  },
}))

const headers = [
  {
    title: 'Proyecto',
    key: 'project.name',
  },
  {
    title: 'Rack',
    key: 'item.delivered.rack',
  },
  {
    title: 'Nivel',
    key: 'item.delivered.level',
  },
  {
    title: 'Módulo',
    key: 'item.delivered.module',
  },
  {
    title: 'Cantidad',
    key: 'item.delivered.quantity',
  },
  {
    title: 'Estatus',
    key: 'status',
  },
  {
    title: 'Fecha',
    key: 'created_at',
  },
]

const getTotal = () => {
  const sum = inbounds.value.reduce((sum, entry) => {
    return sum + parseFloat(entry.item.delivered.quantity)
  }, 0)

  total.value = Math.round(sum * 100) / 100
}


const statusList = [
  { name: 'Registrada', color: 'secondary', icon: 'tabler-package-import', value: 0 },
  { name: 'Almacenada', color: 'success', icon: 'tabler-package-import', value: 1 },
  { name: 'Cancelada', color: 'error', icon: 'tabler-package-import', value: 2 },
]

const getStatusValue = (value, key) => {
  const status = statusList.find(item => item.value === value)
  
  return status ? status[key] : null
}

getTotal()

watch(inbounds, _ => {
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
        class="ml-3 quantity-input"
        style="inline-size: 15.625rem;"
      />
    </div>
  </div>
  <VDataTable
    :headers="headers"
    :items="inbounds"
    :items-per-page="10"
    :search="search"
  >
    <template #item.status="{ item }">
      <VChip :color="getStatusValue(item.status, 'color')">
        <VIcon
          start
          :icon="getStatusValue(item.status, 'icon')"
        />
        {{ getStatusValue(item.status, 'name') }}
      </VChip>
    </template>
    <template #item.created_at="{ item }">
      {{ formatDate(item.updated_at) }}
    </template>
  </VDataTable> 
</template>

<style lang="scss">
.quantity-input {
  input {
    text-align: end;
  }
}
</style>
