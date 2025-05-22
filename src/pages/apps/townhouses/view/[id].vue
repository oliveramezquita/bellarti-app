<script setup>
import EditContactFormDrawer from '@/views/apps/contacts/EditContactFormDrawer.vue'
import NewContactFormDrawer from '@/views/apps/contacts/NewContactFormDrawer.vue'
import ClientInformationForm from '@/views/apps/townhouses/view/ClientInformationForm.vue'
import Contacts from '@/views/apps/townhouses/view/Contacts.vue'
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
const { data: taxDataInfo } = await useApi(`api/tax_data/client/${ route.params.id }`)
const { data: contactsInfo, execute: fetchContacts } = await useApi(`api/contacts/${ route.params.id }`)
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const isAddContactFormDrawerVisible = ref(false)
const isEditContactFormDrawerVisible = ref(false)
const contact = ref()

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

const saveTaxData = async taxData => {
  isLoadingDialogVisible.value = true

  try {
    const newTaxData = new FormData()
    for (const [key, value] of taxData.entries()) {
      if (key !== "_id") { 
        newTaxData.append(key, value)
      }
    }

    await $api(`api/tax_data/client/${ route.params.id }`, {
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

const saveContact = async contactData => {
  isLoadingDialogVisible.value = true

  try {
    await $api(`api/contacts/${ route.params.id }`, {
      method: 'POST',
      body: { ...contactData },
      onResponse({ response }) {
        notificationMessage.value = response._data
        isNotificationVisible.value = true
        fetchContacts()
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const viewEditContactForm = async contactData => {
  contact.value = contactData
  isEditContactFormDrawerVisible.value = true
}

const updateContact = async contactData => {
  isLoadingDialogVisible.value = true

  try {
    await $api(`api/contact/${ contactData._id }`, {
      method: 'PATCH',
      body: {
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
      },
      onResponse({ response }) {
        notificationMessage.value = response._data
        isNotificationVisible.value = true
        fetchContacts()
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const deleteContact = async id => {
  isLoadingDialogVisible.value = true

  try {
    await $api(`api/contact/${ id }`, {
      method: 'DELETE',
      onResponse({ response }) {
        notificationMessage.value = response._data
        isNotificationVisible.value = true
        fetchContacts()
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
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

    <VCardText style="padding: 0;">
      <VWindow v-model="currentTab">
        <VWindowItem>
          <ClientInformationForm
            v-model:client-info="clientData"
            @client-data="updateInformation"
          />
        </VWindowItem>
        <VWindowItem>
          <Contacts
            v-model:contacts-info="contactsInfo"
            @contact-data="isAddContactFormDrawerVisible = true"
            @update-contact-data="viewEditContactForm"
            @delete-contact-data="deleteContact"
          />
        </VWindowItem>
        <VWindowItem>
          <TaxDataInformationForm
            v-model:tax-data-info="taxDataInfo"
            v-model:client-data="clientData"
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
  <NewContactFormDrawer
    v-model:is-drawer-open="isAddContactFormDrawerVisible"
    @contact-data="saveContact"
  />
  <EditContactFormDrawer
    v-model:is-drawer-open="isEditContactFormDrawerVisible"
    v-model:contact-info="contact"
    @contact-data="updateContact"
  />
</template>
