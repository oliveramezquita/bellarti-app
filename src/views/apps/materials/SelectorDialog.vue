<!-- eslint-disable camelcase -->
<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:isDialogVisible', 'generateFormat'])

const dialogVisibleUpdate = val => {
  emit('update:isDialogVisible', val)
}

const searchQuery = ref('')
const supplier = ref()
const division = ref()
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

const headers = [
  {
    title: 'Concepto',
    key: 'concept',
  },
  {
    title: 'División',
    key: 'division',
    sortable: false,
  },
  {
    title: 'U. de Medida',
    key: 'measurement',
    sortable: false,
  },
  {
    title: 'Presentación',
    key: 'presentation',
    sortable: false,
  },
]

const { data: supplierList } = await useApi('api/suppliers?itemsPerPage=100')
const { data: divisions } = await useApi('api/catalogs?name=División de materiales')

const {
  data: materialsData,
} = await useApi(createUrl('api/materials', {
  query: {
    q: searchQuery,
    supplier_id: supplier,
    division: division,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
  },
}))

const materials = computed(() => materialsData.value.data)
const totalMaterials = computed(() => materialsData.value.total_elements)
const selectedMaterials = ref()

const updateOptions = options => {
  page.value = options.page
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const generate = () => {
  emit('generateFormat', selectedMaterials.value)
  emit('update:isDialogVisible', false)
}
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    :width="$vuetify.display.smAndDown ? 'auto' : 1200"
    @update:model-value="dialogVisibleUpdate"
  >
    <!-- 👉 Dialog close btn -->
    <DialogCloseBtn @click="$emit('update:isDialogVisible', false)" />

    <VCard>
      <VCardItem>
        <VCardTitle>
          <div class="d-flex justify-space-between align-center mt-4">
            <div>
              Seleccionar materiales
            </div>
            <div>
              <VBtn
                prepend-icon="tabler-file-excel"
                @click="generate"
              >
                Generar formato
              </VBtn>
            </div>
          </div>
        </VCardTitle>
      </VCardItem>
      <VCardText>
        <VRow>
          <!-- 👉 Select Supplier -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppAutocomplete
              v-model="supplier"
              placeholder="Seleccionar proveedor"
              :items="supplierList.data"
              :item-title="item => item.name"
              :item-value="item => item._id"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="division"
              :items="divisions.values"
              placeholder="Seleccionar división"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
          <VCol
            cols="12"
            sm="4"
          >
            <!-- 👉 Search  -->
            <AppTextField
              v-model="searchQuery"
              placeholder="Buscar material"
            />
          </VCol>
        </VRow>
      </VCardText>
      <VDivider />
      <VCardText style="padding-inline: 0;">
        <VDataTableServer
          v-model:model-value="selectedMaterials"
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :items-per-page-options="[
            { value: 10, title: '10' },
            { value: 20, title: '20' },
            { value: 50, title: '50' },
            { value: -1, title: '$vuetify.dataFooter.itemsPerPageAll' },
          ]"
          :items="materials"
          :items-length="totalMaterials"
          :headers="headers"
          class="text-no-wrap"
          show-select
          @update:options="updateOptions"
        >
          <template #item.concept="{ item }">
            <div class="d-flex gap-x-4">
              <div class="d-flex flex-column">
                <h6
                  class="text-base"
                  style="font-weight: normal;"
                >
                  {{ item.concept }}
                  <br>
                  <small>{{ item.sku }}</small>
                </h6>
              </div>
            </div>
          </template>
          <template #bottom>
            <TablePagination
              v-model:page="page"
              :items-per-page="itemsPerPage"
              :total-items="totalMaterials"
            />
          </template>
        </VDataTableServer>
      </VCardText>
    </VCard>
  </VDialog>
</template>
