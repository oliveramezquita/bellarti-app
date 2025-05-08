<script setup>
import ClientInformationForm from '@/views/apps/townhouses/view/ClientInformationForm.vue'
import TaxDataInformationForm from '@/views/apps/townhouses/view/TaxDataInformationForm.vue'

definePage({
  meta: {
    action: 'read',
    subject: 'CliVS',
  },
})

const route = useRoute('apps-townhouses-view-id')
const currentTab = ref('tab-1')
const { data: clientData } = await useApi(`api/client/${ route.params.id }`)
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const taxDataInfo = ref()

const updateInformation = async data => {
  isLoadingDialogVisible.value = true

  try {
    if (data.hasOwnProperty('_id'))
      delete data._id
    await $api(`api/client/${ route.params.id }`, {
      method: 'PATCH',
      body: data,
      onResponse({ response }) {
        notificationMessage.value = response._data
        isNotificationVisible.value = true
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const saveTaxData = async data => {
  console.log(data)
}
</script>

<template>
  <Breadcrumb
    :items="[{ title: 'Clientes', class: 'text-primary' }, { title: 'Vivienda en Serie', to: { name: 'apps-townhouses-list' }, class: 'text-underline' }, { title: clientData.name }]"
    icon="password-user"
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
          icon="tabler-users"
          class="mb-2"
        />
        <span>Contactos</span>
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
          icon="tabler-home-search"
          class="mb-2"
        />
        <span>Proyectos</span>
      </VTab>
    </VTabs>

    <VCardText>
      <VWindow v-model="currentTab">
        <VWindowItem>
          <ClientInformationForm
            v-model:client-info="clientData"
            @client-data="updateInformation"
          />
        </VWindowItem>
        <VWindowItem>Contactos</VWindowItem>
        <VWindowItem>
          <TaxDataInformationForm
            v-model:tax-data-info="taxDataInfo"
            @tax-data-info="saveTaxData"
          />
        </VWindowItem>
        <VWindowItem>Proyectos </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
    :message="notificationMessage"
  />
</template>
