<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Proveedores',
    navActiveLink: 'apps-townhouses-list',
  },
})
import BankDataInformationForm from '@/views/apps/suppliers/view/BankDataInformationForm.vue'
import SupplierInformationForm from '@/views/apps/suppliers/view/SupplierInformationForm.vue'
import SupplierUpdates from '@/views/apps/suppliers/view/SupplierUpdates.vue'
import TaxDataInformationForm from '@/views/apps/suppliers/view/TaxDataInformationForm.vue'

const route = useRoute('apps-suppliers-view-id')
const { data: supplierInfo } = await useApi(`api/supplier/${ route.params.id }`)
const { data: taxDataInfo } = await useApi(`api/tax_data/${ route.params.id }`)
const { data: bankDataInfo } = await useApi(`api/bank_data/${ route.params.id }`)
const { data: refreshRate } = await useApi(`api/refresh_rate/${ route.params.id }`)
const currentTab = ref('tab-1')
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const breadcrumbItems = ref([{ title: 'Proveedores', to: { name: 'apps-suppliers-list' }, class: 'text-underline' }, { title: supplierInfo.value.name }])

const editSupplier = async supplierData => {
  isLoadingDialogVisible.value = true

  try {
    if (supplierData.hasOwnProperty('_id'))
      delete supplierData._id
    await $api(`api/supplier/${ route.params.id }`, {
      method: 'PATCH',
      body: supplierData,
      onResponse({ response }) {
        notificationMessage.value = response._data
        isNotificationVisible.value = true
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const saveTaxData = async taxData => {
  isLoadingDialogVisible.value = true

  try {
    const newTaxData = new FormData()
    for (const [key, value] of taxData.entries()) {
      if (key !== "_id") { 
        newTaxData.append(key, value)
      }
    }

    await $api(`api/tax_data/${ route.params.id }`, {
      method: 'POST',
      body: newTaxData,
      onResponse({ response }) {
        notificationMessage.value = response._data
        isNotificationVisible.value = true
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const saveBankData = async bankData => {
  isLoadingDialogVisible.value = true

  try {
    if (bankData.hasOwnProperty('_id'))
      delete bankData._id
    await $api(`api/bank_data/${ route.params.id }`, {
      method: 'POST',
      body: bankData,
      onResponse({ response }) {
        notificationMessage.value = response._data
        isNotificationVisible.value = true
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const saveRefreshRate = async refreshRate => {
  isLoadingDialogVisible.value = true

  try {
    if (refreshRate.hasOwnProperty('_id'))
      delete refreshRate._id
    await $api(`api/refresh_rate/${ route.params.id }`, {
      method: 'POST',
      body: refreshRate,
      onResponse({ response }) {
        notificationMessage.value = response._data
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
        <VWindowItem>
          <BankDataInformationForm
            v-model:bank-data-info="bankDataInfo"
            @bank-data-info="saveBankData"
          />
        </VWindowItem>
        <VWindowItem>
          <SupplierUpdates
            v-model:refresh-rate="refreshRate"
            @refresh-rate-data="saveRefreshRate"
          />
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
    :message="notificationMessage"
  />
</template>

<style lang="scss">
.font-weight-bold label {
  font-weight: 700 !important;
}
</style>
