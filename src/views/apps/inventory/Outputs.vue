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
  data: outputs,
} = await useApi(createUrl(`api/outputs/material/${ props.materialId }`, {
  query: {
    created_at: createdAtDate,
  },
}))

const headers = [
  {
    title: '',
    key: 'data-table-expand',
  },
  {
    title: 'Cuantificación',
    key: 'quantification',
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
  total.value = outputs.value
    ?.filter(entry => Number(entry.status) === 1) // forzamos número
    .flatMap(entry => entry.items || [])
    .reduce((sum, item) => {
      const qty = parseFloat(item?.quantity) || 0
      
      return sum + qty
    }, 0)
}

const getOutputData = (items, key) => {
  const item = items.find(item => item.id === props.materialId)

  return item[key] ?? null
}

const statusList = [
  { name: 'Solicitada', color: 'secondary', icon: 'tabler-clipboard-plus', value: 0 },
  { name: 'Aprobada', color: 'success', icon: 'tabler-clipboard-check', value: 1 },
  { name: 'Devolución solicitada', color: 'warning', icon: 'tabler-clipboard-off', value: 2 },
  { name: 'Devolución parcial', color: 'warning', icon: 'tabler-clipboard-off', value: 3 },
  { name: 'Devolución total', color: 'warning', icon: 'tabler-clipboard-off', value: 4 },
  { name: 'Cancelada', color: 'error', icon: 'tabler-clipboard-x', value: 5 },
]

const getStatusValue = (value, key) => {
  const status = statusList.find(item => item.value === value)
  
  return status ? status[key] : null
}

getTotal()

watch(outputs, _ => {
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
    :items="outputs"
    :items-per-page="10"
    :search="search"
    expand-on-click
  >
    <template #expanded-row="slotProps">
      <tr class="v-data-table__tr">
        <td
          :colspan="headers.length"
          style="padding-block-end: 30px;"
        >
          <VRow
            style="margin-inline-start: 0;"
            class="mt-2"
          >
            <VCol
              cols="12"
              md="4"
              class="narrow-column"
            >
              PROYECTO
            </VCol>
            <VCol
              cols="12"
              md="2"
              class="narrow-column"
            >
              RACK
            </VCol>
            <VCol
              cols="12"
              md="2"
              class="narrow-column"
            >
              NIVEL
            </VCol>
            <VCol
              cols="12"
              md="2"
              class="narrow-column"
            >
              MÓDULO
            </VCol>
            <VCol
              cols="12"
              md="2"
              class="narrow-column"
            >
              CANTIDAD
            </VCol>
          </VRow>
          <VRow
            v-for="s in getOutputData(slotProps.item.items, 'source')"
            :key="s.iq_id"
            class="row-table"
          >
            <VCol
              cols="12"
              md="4"
              class="narrow-column"
            >
              <!-- 👉 Project -->
              <AppTextField
                v-model="s.project.name"
                placeholder="Proyecto"
                readonly
              />
            </VCol>
            <VCol
              cols="12"
              md="2"
              class="narrow-column"
            >
              <!-- 👉 Rack -->
              <AppTextField
                v-model="s.rack"
                placeholder="Rack"
                readonly
              />
            </VCol>
            <VCol
              cols="12"
              md="2"
              class="narrow-column"
            >
              <!-- 👉 Level -->
              <AppTextField
                v-model="s.level"
                placeholder="Nivel"
                readonly
              />
            </VCol>
            <VCol
              cols="12"
              md="2"
              class="narrow-column"
            >
              <!-- 👉 Module -->
              <AppTextField
                v-model="s.module"
                placeholder="Módulo"
                readonly
              />
            </VCol>
            <VCol
              cols="12"
              md="2"
              class="narrow-column"
            >
              <!-- 👉 Quantity -->
              <AppTextField
                v-model="s.output"
                placeholder="Cantidad"
                readonly
              />
            </VCol>
          </VRow>
        </td>
      </tr>
    </template>
    <template #item.quantification="{ item }">
      <div v-if="typeof item.quantification === 'object'">
        <label>{{ item.quantification.front }} - {{ item.quantification.prototype }}</label>
        <br>
        <small>{{ item.quantification.area }}</small>
      </div>
      <div v-else>
        <label>{{ item.quantification }}</label>
      </div>
    </template>
    <!-- 👉 Quantity -->
    <template #item.quantity="{ item }">
      {{ getOutputData(item.items, 'quantity') }}
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
