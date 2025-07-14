<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Companias',
  },
})
import AddNewCompanyDrawer from '@/views/apps/companies/AddNewCompanyDrawer.vue'
import EditCompanyDrawer from '@/views/apps/companies/EditCompanyDrawer.vue'

const breadcrumbItems = ref([{ title: 'Administración', class: 'text-primary' }, { title: 'Compañías' }])
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const isLoadingDialogVisible = ref(false)
const isAddNewCompanyDrawerVisible = ref(false)
const isEditCompanyDrawerVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const isDeleteCompanyDialogVisible = ref(false)
const selectedCompany = ref()

const headers = [
  {
    title: '',
    key: 'data-table-expand',
  },
  {
    title: 'Razón social',
    key: 'name',
  },
  {
    title: 'RFC',
    key: 'rfc',
  },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
  },
]

const {
  data: companiesData,
  execute: fetchCompanies,
} = await useApi(createUrl('api/companies', {
  query: {
    q: searchQuery,
    itemsPerPage,
    page,
  },
}))

const companies = computed(() => companiesData.value.data)
const totalCompanies = computed(() => companiesData.value.total_elements)

const addNewCompany = async companyData => {
  isLoadingDialogVisible.value = true
  try {
    await $api('api/companies', {
      method: 'POST',
      body: companyData,
      onResponse({ response }) {
        isNotificationVisible.value = true
        notificationMessage.value = response._data
      },
    })

    fetchCompanies()
  } finally {
    isLoadingDialogVisible.value = false
  } 
}

const viewEditCompanyDrawer = company => {
  selectedCompany.value = company
  isEditCompanyDrawerVisible.value = true
}

const editCompany = async companyData => {
  isLoadingDialogVisible.value = true
  try {
    const filtered = Object.fromEntries(
      Object.entries(companyData).filter(([key, _]) => key !== 'id'),
    )

    await $api(`api/company/${companyData.id}`, {
      method: 'PATCH',
      body: filtered,
      onResponse({ response }) {
        isNotificationVisible.value = true
        notificationMessage.value = response._data
      },
    })
    fetchCompanies()
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const viewDeleteCompanyDialog = company => {
  selectedCompany.value = company
  isDeleteCompanyDialogVisible.value = true
}

const deleteCompany = async id => {
  isLoadingDialogVisible.value = true
  try {
    await $api(`api/company/${id}`, { method: 'DELETE' })
    isDeleteCompanyDialogVisible.value = false

    fetchCompanies()
  } finally {
    isLoadingDialogVisible.value = false
  }
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="settings"
  />
  <section>
    <VCard>
      <VCardText class="d-flex flex-wrap gap-4">
        <VSpacer />

        <div class="d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <AppTextField
            v-model="searchQuery"
            placeholder="Buscar"
            style="inline-size: 15.625rem;"
          />
          <!-- 👉 Add company button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="isAddNewCompanyDrawerVisible = true"
          >
            Agregar nueva compañía
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTable
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items-per-page-options="[
          { value: 10, title: '10' },
          { value: 20, title: '20' },
          { value: 50, title: '50' },
          { value: -1, title: '$vuetify.dataFooter.itemsPerPageAll' },
        ]"
        :items="companies"
        :items-length="totalCompanies"
        :headers="headers"
        expand-on-click
        @update:options="updateOptions"
      >
        <!-- Expanded Row Data -->
        <template #expanded-row="slotProps">
          <tr class="v-data-table__tr">
            <td :colspan="headers.length">
              <br>
              <p>
                <b>Dirección:</b> {{ `${slotProps.item.address} CP. ${slotProps.item.postal_code} ${slotProps.item.city}, ${slotProps.item.state}` }} 
              </p>
              <p>
                <b>Correo electrónico:</b> {{ slotProps.item.email }}
              </p>
            </td>
          </tr>
        </template>
        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn @click="viewEditCompanyDrawer(item)">
            <VIcon icon="tabler-pencil" />
          </IconBtn>
          <IconBtn @click="viewDeleteCompanyDialog(item)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>
      </VDataTable>
    <!-- SECTION -->
    </VCard>
    <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
    <AddNewCompanyDrawer
      v-model:is-drawer-open="isAddNewCompanyDrawerVisible"
      @company-data="addNewCompany"
    />
    <EditCompanyDrawer
      v-model:is-drawer-open="isEditCompanyDrawerVisible"
      v-model:company-info="selectedCompany"
      @company-data="editCompany"
    />
    <Notification
      v-model:is-notification-visible="isNotificationVisible"
      :message="notificationMessage"
    />
    <VDialog
      v-model="isDeleteCompanyDialogVisible"
      width="500"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDeleteCompanyDialogVisible = !isDeleteCompanyDialogVisible" />

      <!-- Dialog Content -->
      <VCard title="Eliminar compañía">
        <VCardText>
          ¿Estás seguro de eliminar la compañía <b>{{ selectedCompany.name }}</b>?, ten en cuenta que ya no se asignará dicha compañia en las ordenes de compra.
        </VCardText>

        <VCardText class="d-flex justify-end">
          <VBtn @click="deleteCompany(selectedCompany._id)">
            Eliminar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>
