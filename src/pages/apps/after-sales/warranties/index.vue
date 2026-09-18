<!-- eslint-disable camelcase -->
<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'ASGarantias',
  },
})

const NewWarrantyFormDrawer  = defineAsyncComponent(() => import('@/views/apps/after-sales/warranties/NewWarrantyFormDrawer.vue'))
const EditWarrantyFormDrawer = defineAsyncComponent(() => import('@/views/apps/after-sales/warranties/EditWarrantyFormDrawer.vue'))

const breadcrumbItems = ref([{ title: 'Postventa', class: 'text-primary' }, { title: 'Garantías' }])

const selectedWarrannty = ref()

//Table
const {
  data: warranties,
  execute: fetchWarranties,
} = await useApi(createUrl('api/after_sales/warranties'))

const headers = [
  {
    title: 'Nombre',
    key: 'name',
  },
  {
    title: 'Duración (años)',
    key: 'duration',
    sortable: false,
  },
  {
    title: 'Estatus',
    key: 'is_available',
    sortable: false,
  },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
  },
]

//Search
const search = ref('')

//Loading dialog
const isLoadingDialogVisible = ref(false)

//Notifications
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const notificationColor = ref('info')

//New warranty
const isAddWarrantyFormDrawerVisible = ref(false)

const saveWarranty = async warranty => {
  isLoadingDialogVisible.value = true

  const filtered = {
    ...Object.fromEntries(
      Object.entries(warranty).filter(([_, value]) => value !== undefined)),
  }

  try {
    await $api(`api/after_sales/warranties`, {
      method: 'POST',
      body: filtered,
      onResponse({ response }) {
        notificationColor.value = getStatusColor(response.status)
        notificationMessage.value = response._data
        isNotificationVisible.value = true
        fetchWarranties()
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

//Edit warranty
const isEditWarrantyFormDrawerVisible = ref(false)

const viewEditWarrantyDrawer = warranty => {
  selectedWarrannty.value = warranty
  isEditWarrantyFormDrawerVisible.value = true
}

const updateWarranty = async warranty => {
  isLoadingDialogVisible.value = true

  const { _id: id, ...data } = JSON.parse(JSON.stringify(warranty))

  try {
    await $api(`api/after_sales/warranty/${ id }`, {
      method: 'PATCH',
      body: data,
      onResponse({ response }) {
        notificationColor.value = getStatusColor(response.status)
        notificationMessage.value = response._data
        isNotificationVisible.value = true
        fetchWarranties()
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

//Unavailable warranty
const isUnavailableWarrantyDialogVisible = ref(false)

const viewUnavailableWarrantyDialog = warranty => {
  selectedWarrannty.value = warranty
  isUnavailableWarrantyDialogVisible.value = true
}

const availabilityWarranty = async (id, action) => {
  isLoadingDialogVisible.value = true

  try {
    await $api(`api/after_sales/warranty/${action}/${id}`, {
      method: 'PATCH',
      onResponse({ response }) {
        notificationColor.value = getStatusColor(response.status)
        notificationMessage.value = response._data
        isNotificationVisible.value = true
        fetchWarranties()

        isUnavailableWarrantyDialogVisible.value = false
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="device-mobile-message"
  />
  <section>
    <VCard>
      <VCardText class="d-flex flex-wrap gap-4">
        <VSpacer />

        <div class="d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <AppTextField
            v-model="search"
            placeholder="Buscar"
            style="inline-size: 15.625rem;"
          />
          <!-- 👉 Add company button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="isAddWarrantyFormDrawerVisible = true"
          >
            Agregar garantía
          </VBtn>
        </div>
      </VCardText>

      <VDivider />
      
      <VDataTable
        :headers="headers"
        :items="warranties"
        :items-per-page="10"
        :search="search"
      >
        <!-- Status -->
        <template #item.is_available="{ item }">
          <span>{{ item.is_available ? "Disponible" : 'No disponible' }}</span>
        </template>
        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn @click="viewEditWarrantyDrawer(item)">
            <VIcon icon="tabler-pencil" />
          </IconBtn> 
            
          <IconBtn
            v-if="item.is_available"
            @click="viewUnavailableWarrantyDialog(item)"
          >
            <VIcon icon="tabler-cancel" />
          </IconBtn>
          <IconBtn
            v-if="!item.is_available"
            @click="availabilityWarranty(item._id, 'available')"
          >
            <VIcon icon="tabler-check" />
          </IconBtn>
        </template>
      </VDataTable>
    </VCard>
  </section>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
    :message="notificationMessage"
    :color="notificationColor"
  />
  <NewWarrantyFormDrawer
    v-model:is-drawer-open="isAddWarrantyFormDrawerVisible"
    @warranty-data="saveWarranty"
  />
  <EditWarrantyFormDrawer
    v-model:is-drawer-open="isEditWarrantyFormDrawerVisible"
    v-model:warranty-info="selectedWarrannty"
    @warranty-data="updateWarranty"
  />
  <VDialog
    v-model="isUnavailableWarrantyDialogVisible"
    width="500"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="isUnavailableWarrantyDialogVisible = !isUnavailableWarrantyDialogVisible" />

    <!-- Dialog Content -->
    <VCard title="Deshabilitar garantía">
      <VCardText>
        ¿Estás seguro de deshabilitar la garantía: <b>{{ selectedWarrannty.name }}</b>?
      </VCardText>

      <VCardText class="d-flex justify-end">
        <VBtn @click="availabilityWarranty(selectedWarrannty._id, 'unavailable')">
          Deshabilitar
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
