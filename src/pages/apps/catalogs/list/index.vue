<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Catalogos',
  },
})

const router = useRouter()
const breadcrumbItems = ref([{ title: 'Catálogos', class: 'text-primary' }])
const search = ref('')
const isDeleteCatalogDialogVisible = ref(false)
const selectedCatalog = ref()

const {
  data: catalogsData,
  execute: fetchCatalogs } = await useApi(createUrl('api/catalogs'))

const headers = [
  {
    title: '',
    key: 'data-table-expand',
  },
  {
    title: 'Nombre',
    key: 'name',
  },
  {
    title: 'Valores',
    key: 'values',
    sortable: false,
  },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
  },
]

const formatList = list => {
  if (list.length === 0) return ""
  if (list.length === 1) return list[0]
  if (list.length === 2) return list.join(" y ")
  
  return list.slice(0, -1).join(", ") + " y " + list[list.length - 1]
}

const processObject = (obj, limit = null) => {
  let values = ''
  if (Array.isArray(obj.values)) {
    values = formatList(obj.values)
  } else if (typeof obj.values === "object" && obj.values !== null) {
    values = Object.entries(obj.values)
      .map(([key, value]) => `${key}: ${formatList(value)}`)
      .join(", ")
  } else {
    values = ''
  }

  return limit && values.length > limit ? values.slice(0, limit) + '...' : values
}

const editCatalog = id => {
  router.replace(`/apps/catalogs/view/${id}`)
}

const selectCatalog = catalog => {
  selectedCatalog.value = catalog
  isDeleteCatalogDialogVisible.value = true
}

const deleteCatalog = async id => {
  await $api(`api/catalog/${id}`, { method: 'DELETE' })
  isDeleteCatalogDialogVisible.value = false
  fetchCatalogs()
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="files"
  />
  <section>
    <VCard>
      <VCardText class="d-flex flex-wrap gap-4 justify-end">
        <div class="d-flex flex-wrap gap-4">
          <!-- 👉 Search  -->
          <AppTextField
            v-model="search"
            placeholder="Buscar"
            style="inline-size: 300px;"
          />
          <!-- 👉 Add user button -->
          <VBtn
            prepend-icon="tabler-plus"
            :to="{name: 'apps-catalogs-new'}"
          >
            Añadir Catálogo
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTable
        :headers="headers"
        :items="catalogsData"
        :items-per-page="10"
        :search="search"
        expand-on-click
      >
        <template #expanded-row="slotProps">
          <tr class="v-data-table__tr">
            <td :colspan="headers.length">
              <ul
                v-if="Array.isArray(slotProps.item.values)"
                class="list-values"
              >
                <li
                  v-for="value in slotProps.item.values"
                  :key="value"
                >
                  {{ value }}
                </li>
              </ul>
              <ul
                v-else-if="typeof slotProps.item.values === 'object' && slotProps.item.values !== null"
                class="list-values"
              >
                <li
                  v-for="value, key in slotProps.item.values"
                  :key="key"
                >
                  {{ `${key}: ${formatList(value)}` }}
                </li>
              </ul>
            </td>
          </tr>
        </template>

        <!-- Name -->
        <template #item.name="{ item }">
          <div class="d-flex gap-x-4">
            <div class="d-flex flex-column">
              <h6
                class="text-base"
                style="font-weight: normal;"
              >
                {{ item.name }}
              </h6>
            </div>
          </div>
        </template>

        <template #item.values="{ item }">
          <div>
            {{ processObject(item, 60) }}
          </div>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn>
            <VIcon
              icon="tabler-pencil"
              @click.stop="editCatalog(item.id)"
            />
          </IconBtn> 
          
          <IconBtn>
            <VIcon
              icon="tabler-trash"
              @click.stop="selectCatalog(item)"
            />
          </IconBtn>
        </template>
      </VDataTable>
    </VCard>
  </section>
  <VDialog
    v-model="isDeleteCatalogDialogVisible"
    width="500"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="isDeleteCatalogDialogVisible = !isDeleteCatalogDialogVisible" />

    <!-- Dialog Content -->
    <VCard title="Eliminar Catálogo">
      <VCardText>
        ¿Estás seguro de eliminar el catálogo <b>{{ selectedCatalog.name }}</b>, algunos elementos dentro del sistema pueden depender de los valores del catálogo?
      </VCardText>

      <VCardText class="d-flex justify-end">
        <VBtn @click="deleteCatalog(selectedCatalog._id)">
          Eliminar
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.list-values {
  padding-block: 20px;
  padding-inline: 70px 20px;
}
</style>
