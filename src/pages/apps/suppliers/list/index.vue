<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Proveedores',
  },
})
import AddNewSupplierDrawer from '@/views/apps/suppliers/list/AddNewSupplierDrawer.vue'
import EditSupplierDrawer from '@/views/apps/suppliers/list/EditSupplierDrawer.vue'

const breadcrumbItems = ref([{ title: 'Proveedores', class: 'text-primary' }])
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const isAddNewSupplierDrawerVisible = ref(false)
const isEditSupplierDrawerVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const isDeleteSupplierDialogVisible = ref(false)
const selectedSupplier = ref()

const headers = [
  {
    title: 'Nombre',
    key: 'name',
  },
  {
    title: 'Dirección',
    key: 'address',
  },
  {
    title: 'Correo electrónico',
    key: 'email',
  },
  {
    title: 'Teléfono',
    key: 'phone',
  },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
  },
]

const {
  data: suppliersData,
  execute: fetchSuppliers,
} = await useApi(createUrl('api/suppliers', {
  query: {
    q: searchQuery,
    itemsPerPage,
    page,
  },
}))

const suppliers = computed(() => suppliersData.value.data)
const totalSuppliers = computed(() => suppliersData.value.total_elements)

const addNewSupplier = async supplierData => {
  const type = 'VS'

  const filtered = {
    ...Object.fromEntries(
      Object.entries(supplierData).filter(([_, value]) => value !== undefined)),
    type,
  }

  await $api('api/suppliers', {
    method: 'POST',
    body: filtered,
    onResponse({ response }) {
      isNotificationVisible.value = true
      notificationMessage.value = response._data
    },
  })

  // Refetch Supplier
  fetchSuppliers()
}

const viewEditSupplierDrawer = supplier => {
  selectedSupplier.value = supplier
  isEditSupplierDrawerVisible.value = true
}

const viewDeleteSupplierDialog = supplier => {
  selectedSupplier.value = supplier
  isDeleteSupplierDialogVisible.value = true
}

const editSupplier = async supplierData => {
  const filtered = Object.fromEntries(
    Object.entries(supplierData).filter(([key, value]) => key !== 'id' && value !== null),
  )

  await $api(`api/supplier/${supplierData.id}`, {
    method: 'PATCH',
    body: filtered,
    onResponse({ response }) {
      isNotificationVisible.value = true
      notificationMessage.value = response._data
    },
  })
  fetchSuppliers()
}

const deleteSupplier = async id => {
  await $api(`api/supplier/${id}`, { method: 'DELETE' })
  isDeleteSupplierDialogVisible.value = false
  fetchSuppliers()
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="password-user"
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
              { value: -1, title: 'Todos' },
            ]"
            style="inline-size: 5.5rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>

        <VSpacer />

        <div class="d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <AppTextField
            v-model="searchQuery"
            placeholder="Buscar"
            style="inline-size: 15.625rem;"
          />
          <!-- 👉 Add user button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="isAddNewSupplierDrawerVisible = true"
          >
            Agregar nuevo proveedor
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
        :items="suppliers"
        :items-length="totalSuppliers"
        :headers="headers"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <!-- Name -->
        <template #item.name="{ item }">
          <div class="d-flex align-center gap-x-4">
            <div class="d-flex flex-column">
              <h6
                class="text-base"
                style="font-weight: normal;"
              >
                <RouterLink
                  :to="{ name: 'apps-suppliers-view-id', params: { id: item._id } }"
                  class="font-weight-medium text-link"
                >
                  {{ item.name }}
                </RouterLink>
              </h6>
            </div>
          </div>
        </template>

        <template #item.address="{ item }">
          <div class="text-body-1 text-high-emphasis text-capitalize">
            {{ item.address }}
          </div>
        </template>

        <template #item.email="{ item }">
          <div class="text-body-1 text-high-emphasis">
            {{ item.email }}
          </div>
        </template>

        <template #item.phone="{ item }">
          <div class="text-body-1 text-high-emphasis text-capitalize">
            {{ item.phone }}
          </div>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn @click="viewEditSupplierDrawer(item)">
            <VIcon icon="tabler-pencil" />
          </IconBtn>
          <IconBtn @click="viewDeleteSupplierDialog(item)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalSuppliers"
          />
        </template>
      </VDataTableServer>
    <!-- SECTION -->
    </VCard>
    <AddNewSupplierDrawer
      v-model:is-drawer-open="isAddNewSupplierDrawerVisible"
      @supplier-data="addNewSupplier"
    />
    <EditSupplierDrawer
      v-model:is-drawer-open="isEditSupplierDrawerVisible"
      v-model:supplier-info="selectedSupplier"
      @supplier-data="editSupplier"
    />
    <Notification
      v-model:is-notification-visible="isNotificationVisible"
      :message="notificationMessage"
    />
    <VDialog
      v-model="isDeleteSupplierDialogVisible"
      width="500"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDeleteSupplierDialogVisible = !isDeleteSupplierDialogVisible" />

      <!-- Dialog Content -->
      <VCard title="Eliminar proveedor">
        <VCardText>
          ¿Estás seguro de eliminar el proveedor <b>{{ selectedSupplier.name }}</b>?, ten en cuenta que al eliminar al proveedor todos los materiales asignados serán desactivados.
        </VCardText>

        <VCardText class="d-flex justify-end">
          <VBtn @click="deleteSupplier(selectedSupplier._id)">
            Eliminar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>

