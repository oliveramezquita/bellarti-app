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
  data: ibounds,
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
    title: 'Estatus',
    key: 'status',
  },
  {
    title: 'Fecha',
    key: 'created_at',
  },
]

const getTotal = () => {
  total.value = ibounds.value
    ?.filter(entry => Number(entry.status) === 1) // forzamos número
    .flatMap(entry => entry.items || [])
    .reduce((sum, item) => {
      const qty = parseFloat(item?.delivered?.quantity) || 0
      
      return sum + qty
    }, 0)
}

const getInboundData = (items, key) => {
  const item = items.find(item => item.material_id === props.materialId)

  return item.delivered[key] ?? null
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
        class="ml-3 quantity-input"
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
    <!-- 👉 Rack -->
    <template #item.rack="{ item }">
      {{ getInboundData(item.items, 'rack') }}
    </template>
    <!-- 👉 Level -->
    <template #item.level="{ item }">
      {{ getInboundData(item.items, 'level') }}
    </template>
    <!-- 👉 Module -->
    <template #item.module="{ item }">
      {{ getInboundData(item.items, 'module') }}
    </template>
    <!-- 👉 Quantity -->
    <template #item.quantity="{ item }">
      {{ getInboundData(item.items, 'quantity') }}
    </template>
    <!-- 👉 Status -->
    <template #item.status="{ item }">
      <VChip :color="getStatusValue(item.status, 'color')">
        <VIcon
          start
          :icon="getStatusValue(item.status, 'icon')"
        />
        {{ getStatusValue(item.status, 'name') }}
      </VChip>
    </template>
    <!-- 👉 Created at -->
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
