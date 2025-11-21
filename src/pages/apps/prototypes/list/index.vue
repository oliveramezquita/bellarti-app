<!-- eslint-disable camelcase -->
<script setup>
import AddNewPrototypeDrawer from '@/views/apps/prototypes/AddNewPrototypeDrawer.vue'
import { watchDebounced } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

definePage({
  meta: { action: 'read', subject: 'VSPrototipos' },
})

// 📍 Route y filtros iniciales
const route = useRoute('apps-prototypes-list')
const client = ref(route.query?.client_id ?? null)
const front = ref(route.query?.front ?? null)
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

// 📍 Estados UI
const isAddNewPrototypeDrawerVisible = ref(false)
const isLoading = ref(false)
const notification = ref({ visible: false, message: '', color: 'info' })
const deleteDialog = ref({ visible: false, prototype: null })

// 📍 Datos estáticos
const headers = [
  { title: '', key: 'data-table-expand' },
  { title: 'Cliente', key: 'client_name' },
  { title: 'Nombre', key: 'name' },
  { title: 'Frente / Fraccionamiento', key: 'front' },
  { title: 'Tendencias', key: 'tendencies', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const breadcrumbItems = [
  { title: 'Vivienda en Serie', class: 'text-primary' },
  { title: 'Prototipos' },
]

// 📡 Peticiones API
const {
  data: prototypesData,
  execute: fetchPrototypes,
} = await useApi(createUrl('api/prototypes', {
  query: { q: searchQuery, client_id: client, front, itemsPerPage, page, sortBy, orderBy },
}))

const [
  { data: clientsList },
  { data: prototypesCatalog, execute: fetchCatalogPrototypes },
  { data: frontsCatalog, execute: fetchCatalogFronts },
] = await Promise.all([
  useApi('api/clients/VS?itemsPerPage=100'),
  useApi('api/catalogs?name=Prototipos'),
  useApi('api/catalogs?name=Frentes'),
])

// 📊 Datos computados
const prototypes = computed(() => prototypesData.value.data)
const totalPrototypes = computed(() => prototypesData.value.total_elements)

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const listFronts = computed(() => {
  if (!frontsCatalog.value?.values) return []
  
  return [...new Set(Object.values(frontsCatalog.value.values).flat())].sort((a, b) => a.localeCompare(b))
})

// 🧠 Watchers optimizados
watchDebounced(
  [searchQuery, client, front, page, itemsPerPage],
  () => fetchPrototypes(),
  { debounce: 400, immediate: true },
)

// ➕ Crear prototipo
const addNewPrototype = async prototypeData => {
  isLoading.value = true
  try {
    const filtered = Object.fromEntries(Object.entries(prototypeData).filter(([_, v]) => v != null))

    await $api('api/prototypes', {
      method: 'POST',
      body: filtered,
      onResponse({ response }) {
        console.log('RESPONSE:', response)

        notification.value = {
          visible: true,
          message: response._data,
          color: getStatusColor(response.status),
        }

        if (response.status === 201) {
          Promise.all([
            fetchCatalogPrototypes(),
            fetchCatalogFronts(),
            fetchPrototypes(),
          ])
        }
      },
    })
  } finally {
    isLoading.value = false
  }
}


// 🗑️ Eliminar prototipo
const confirmDelete = prototype => (deleteDialog.value = { visible: true, prototype })

const deletePrototype = async () => {
  const id = deleteDialog.value.prototype?._id
  if (!id) return

  isLoading.value = true
  try {
    await $api(`api/prototype/${id}`, { method: 'DELETE' })
    deleteDialog.value.visible = false
    await fetchPrototypes()
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    icon="home-stats"
  />

  <section>
    <VCard>
      <!-- 🔍 Filtros -->
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="client"
              label="Cliente"
              placeholder="Filtrar por cliente"
              :item-title="i => i.name"
              :item-value="i => i._id"
              :items="clientsList.data"
              clearable
            />
          </VCol>

          <VCol
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="front"
              label="Frente / Fraccionamiento"
              placeholder="Filtrar por frente / fracc."
              :items="listFronts"
              clearable
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <!-- 🔢 Configuración y búsqueda -->
      <VCardText class="d-flex flex-wrap gap-4">
        <div class="d-flex gap-2 align-center">
          <p class="text-body-1 mb-0">
            Mostrar
          </p>
          <AppSelect
            v-model="itemsPerPage"
            :items="[{ value: 10, title: '10' }, { value: 25, title: '25' }, { value: 50, title: '50' }, { value: 100, title: '100' }]"
            style="inline-size: 5.5rem;"
          />
        </div>

        <VSpacer />

        <div class="d-flex align-center flex-wrap gap-4">
          <AppTextField
            v-model="searchQuery"
            placeholder="Buscar"
            style="inline-size: 16.625rem;"
          />
          <VBtn
            prepend-icon="tabler-plus"
            @click="isAddNewPrototypeDrawerVisible = true"
          >
            Añadir prototipo
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- 🧾 Tabla -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="prototypes"
        :items-length="totalPrototypes"
        :headers="headers"
        class="text-no-wrap"
        expand-on-click
        @update:options="updateOptions"
      >
        <template #item.name="{ item }">
          <RouterLink
            :to="{ name: 'apps-prototypes-view-id', params: { id: item._id } }"
            class="font-weight-medium text-underline"
          >
            {{ item.name }}
          </RouterLink>
        </template>

        <template #item.tendencies="{ item }">
          <VAvatar
            :color="item.tendencies ? 'success' : 'secondary'"
            icon="tabler-chart-donut"
            size="small"
            variant="text"
          />
        </template>

        <template #expanded-row="{ item }">
          <tr>
            <td :colspan="headers.length">
              <div class="inner-table">
                <div class="row header">
                  <div class="cell align-left">
                    TENDENCIA
                  </div>
                  <div class="cell">
                    PORCENTAJE
                  </div>
                </div>

                <div v-if="item.tendencies?.length">
                  <div
                    v-for="t in item.tendencies"
                    :key="`${t.melamine}-${t.granite}`"
                    class="row"
                  >
                    <div class="cell align-left">
                      {{ `${t.melamine} - ${t.granite}` }}
                    </div>
                    <div class="cell">
                      {{ `${t.percentage}%` }}
                    </div>
                  </div>
                </div>
                <div
                  v-else
                  class="row"
                >
                  <div class="cell">
                    Sin tendencias hasta el momento
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </template>

        <template #item.actions="{ item }">
          <IconBtn :to="{ name: 'apps-prototypes-view-id', params: { id: item._id } }">
            <VIcon icon="tabler-pencil" />
          </IconBtn>
          <IconBtn @click="confirmDelete(item)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalPrototypes"
          />
        </template>
      </VDataTableServer>
    </VCard>

    <!-- 🧩 Componentes secundarios -->
    <AddNewPrototypeDrawer
      v-model:is-drawer-open="isAddNewPrototypeDrawerVisible"
      v-model:clients-list="clientsList.data"
      v-model:prototypes-catalog="prototypesCatalog"
      v-model:fronts-catalog="frontsCatalog"
      @prototype-data="addNewPrototype"
    />

    <LoadingDataDialog v-model:is-dialog-visible="isLoading" />
    <Notification
      v-model:is-notification-visible="notification.visible"
      :message="notification.message"
      :color="notification.color"
    />

    <VDialog
      v-model="deleteDialog.visible"
      width="500"
    >
      <DialogCloseBtn @click="deleteDialog.visible = false" />
      <VCard title="Eliminar prototipo">
        <VCardText>
          ¿Eliminar el prototipo {{ deleteDialog.prototype?.name }}? La volumetría asociada dejará de estar disponible.
        </VCardText>
        <VCardText class="d-flex justify-end">
          <VBtn
            color="error"
            @click="deletePrototype"
          >
            Eliminar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>

<style scoped lang="scss">
.inner-table {
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
  font-size: 0.85rem;
  inline-size: 100%;
  margin-block: 20px;

  .row {
    display: flex;
    border-block-end: 1px solid #ccc;
  }

  .cell {
    flex: 1;
    padding: 5px;
    border-inline-end: 1px solid #ccc;
    text-align: center;

    &.align-left {
      text-align: start !important;
    }
  }

  .row:last-child,
  .cell:last-child {
    border: none;
  }

  .header {
    background-color: #f5f5f5;
    font-weight: bold;
  }
}
</style>
