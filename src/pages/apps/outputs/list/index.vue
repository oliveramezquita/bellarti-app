<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'AlmSalidas',
  },
})

const breadcrumbItems = ref([{ title: 'Almacén', class: 'text-primary' }, { title: 'Salidas' }])
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)

const headers = [
  {
    title: 'ID',
    key: 'folio',
  },
  {
    title: 'Cuantificación',
    key: 'quantification',
  },
  {
    title: 'Total',
    key: 'total_items',
  },
  {
    title: 'Fecha de registro',
    key: 'created_at',
  },
  {
    title: 'Estatus',
    key: 'status',
  },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
  },
]

const statusList = [
  { name: 'Solicitada', color: 'secondary', icon: 'tabler-clipboard-plus', value: 0 },
  { name: 'Aprobada', color: 'success', icon: 'tabler-clipboard-check', value: 1 },
  { name: 'Devolución solicitada', color: 'warning', icon: 'tabler-clipboard-off', value: 2 },
  { name: 'Devolución parcial', color: 'warning', icon: 'tabler-clipboard-off', value: 3 },
  { name: 'Devolución total', color: 'warning', icon: 'tabler-clipboard-off', value: 4 },
  { name: 'Cancelada', color: 'error', icon: 'tabler-clipboard-x', value: 5 },
]

const {
  data: outputsData,
  execute: fetchOutputs,
} = await useApi(createUrl('api/outputs', {
  query: {
    q: searchQuery,
    itemsPerPage,
    page,
  },
}))

const outputs = computed(() => outputsData.value.data)
const totalOutputs = computed(() => outputsData.value.total_elements)

const getStatusValue = (value, key) => {
  const status = statusList.find(item => item.value === value)
  
  return status ? status[key] : null
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="building-warehouse"
  />
  <section>
    <VCard>
      <VCardText class="d-flex flex-wrap gap-4">
        <div class="d-flex gap-2 align-center">
          <p class="text-body-1 mb-0">
            Mostrar
          </p>
          <AppSelect
            :model-value="itemsPerPage"
            :items="[
              { value: 10, title: '10' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
            ]"
            style="inline-size: 5.5rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>

        <VSpacer />

        <div class="d-flex align-center flex-wrap gap-4">
          <!-- 👉 Add inbound button -->
          <VBtn
            prepend-icon="tabler-plus"
            :to="{name: 'apps-outputs-new'}"
          >
            Agregar salida
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items-per-page-options="[
          { value: 10, title: '10' },
          { value: 20, title: '20' },
          { value: 50, title: '50' },
          { value: -1, title: '$vuetify.dataFooter.itemsPerPageAll' },
        ]"
        :items="outputs"
        :items-length="totalOuputs"
        :headers="headers"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <template #item.folio="{ item }">
          <div class="d-flex gap-x-4">
            <div class="d-flex flex-column">
              <h6
                class="text-base"
                style="font-weight: normal;"
              >
                <RouterLink
                  :to="{ name: 'apps-outputs-view-id', params: { id: item._id } }"
                  class="font-weight-medium text-link"
                >
                  {{ item.folio }}
                </RouterLink>
              </h6>
            </div>
          </div>
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
        <template #item.created_at="{ item }">
          <label>{{ formatDate(item.created_at) }}</label>
        </template>
        <template #item.status="{ item }">
          <div class="align-center">
            <VBtn
              :color="getStatusValue(item.status, 'color')"
              variant="plain"
            >
              <VIcon
                start
                :icon="getStatusValue(item.status, 'icon')"
              />{{ getStatusValue(item.status, 'name') }}
            </VBtn>
          </div>
        </template>
        <template #item.actions="{ item }">
          <IconBtn :to="{name: 'apps-outputs-view-id', params: {id: item._id}}">
            <VIcon icon="tabler-eye" />
          </IconBtn>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalOutputs"
          />
        </template>
      </VDataTableServer>
    </VCard>
    <!-- SECTION -->
  </section>
</template>
