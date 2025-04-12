<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Proveedores',
  },
})
import SupplierInformationForm from '@/views/apps/suppliers/view/SupplierInformationForm.vue'
import TaxDataInformationForm from '@/views/apps/suppliers/view/TaxDataInformationForm.vue'

const route = useRoute('apps-suppliers-view-id')
const { data: supplierInfo } = await useApi(`api/supplier/${ route.params.id }`)
const { data: taxDataInfo } = await useApi(`api/tax_data/${ route.params.id }`)
const currentTab = ref('tab-1')
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const breadcrumbItems = ref([{ title: 'Proveedores', to: { name: 'apps-suppliers-list' }, class: 'text-underline' }, { title: supplierInfo.value.name }])

const editSupplier = async supplierData => {
  console.log(supplierData)
}

const saveTaxData = async taxData => {
  isLoadingDialogVisible.value = true

  try {
    await $api(`api/tax_data/${ route.params.id }`, {
      method: 'POST',
      body: taxData,
      onResponse({ response }) {
        if (response.status === 200) {
          volumetry.value = response._data.data
          notificationMessage.value = response._data.message
        } else {
          notificationMessage.value = response._data
        }
        isNotificationVisible.value = true
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
    icon="users"
  />
  <VCard class="py-3">
    <VTabs
      v-model="currentTab"
      grow
      stacked
    >
      <VTab>
        <VIcon
          icon="tabler-info-circle"
          class="mb-2"
        />
        <span>Información</span>
      </VTab>

      <VTab>
        <VIcon
          icon="tabler-user-dollar"
          class="mb-2"
        />
        <span>Datos Fiscales</span>
      </VTab>

      <VTab>
        <VIcon
          icon="tabler-building-bank"
          class="mb-2"
        />
        <span>Datos Bancarios</span>
      </VTab>

      <VTab>
        <VIcon
          icon="tabler-refresh-alert"
          class="mb-2"
        />
        <span>Actualizaciones</span>
      </VTab>
    </VTabs>

    <VCardText>
      <VWindow v-model="currentTab">
        <VWindowItem>
          <SupplierInformationForm
            v-model:supplier-info="supplierInfo"
            @supplier-data="editSupplier"
          />
        </VWindowItem>
        <VWindowItem>
          <TaxDataInformationForm
            v-model:tax-data-info="taxDataInfo"
            v-model:supplier-info="supplierInfo"
            @tax-data-info="saveTaxData"
          />
        </VWindowItem>
        <VWindowItem>Datos Bancarios</VWindowItem>
        <VWindowItem>Actualizaciones</VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
    :message="notificationMessage"
  />
</template>
