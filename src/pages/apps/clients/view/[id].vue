<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Clientes',
  },
})
import ClientInformationForm from '@/views/apps/clients/view/ClientInformationForm.vue'
import Contacts from '@/views/apps/clients/view/Contacts.vue'
import TaxDataInformationForm from '@/views/apps/clients/view/TaxDataInformationForm.vue'
import { defineAsyncComponent } from 'vue'

const EditContactFormDrawer = defineAsyncComponent(() => import('@/views/apps/contacts/EditContactFormDrawer.vue'))
const NewContactFormDrawer  = defineAsyncComponent(() => import('@/views/apps/contacts/NewContactFormDrawer.vue'))

const route = useRoute('apps-clients-view-id')
const currentTab = ref('tab-1')

const [
  { data: clientData },
  { data: taxDataInfo },
  { data: contactsInfo, execute: fetchContacts },
] = await Promise.all([
  useApi(`api/client/${ route.params.id }`),
  useApi(`api/tax_data/client/${ route.params.id }`),
  useApi(`api/contacts/${ route.params.id }`),
])

const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const notificationColor = ref('info')
const isAddContactFormDrawerVisible = ref(false)
const isEditContactFormDrawerVisible = ref(false)
const isDeleteContactDialogVisible = ref(false)
const contact = ref()

const breadcrumbItems = ref([
  { title: 'Clientes', class: 'text-primary' },
  {
    title: clientData.value.type === 'PE' ? 'Proyectos Especiales' : 'Vivienda en Serie', 
    to: { name: clientData.value.type === 'PE' ? 'apps-clients-list-pe' : 'apps-clients-list-vs' },
    class: 'text-underline',
  },
  { title: clientData.value.name },
])

const updateInformation = async data => {
  isLoadingDialogVisible.value = true

  try {
    if (data.hasOwnProperty('_id'))
      delete data._id
    await $api(`api/client/${ route.params.id }`, {
      method: 'PATCH',
      body: data,
      onResponse({ response }) {
        notificationColor.value = getStatusColor(response.status)
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
        notificationColor.value = getStatusColor(response.status)
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
        notificationColor.value = getStatusColor(response.status)
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
        notificationColor.value = getStatusColor(response.status)
        notificationMessage.value = response._data
        isNotificationVisible.value = true
        fetchContacts()
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const viewDeleteContactDialog = async contactData => {
  contact.value = contactData
  isDeleteContactDialogVisible.value = true
}

const deleteContact = async id => {
  isLoadingDialogVisible.value = true

  try {
    await $api(`api/contact/${ id }`, {
      method: 'DELETE',
      onResponse({ response }) {
        notificationColor.value = getStatusColor(response.status)
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
    :items="breadcrumbItems"
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
            @delete-contact-data="viewDeleteContactDialog"
          />
        </VWindowItem>
        <VWindowItem>
          <TaxDataInformationForm
            v-model:tax-data-info="taxDataInfo"
            v-model:client-data="clientData"
            @tax-data-info="saveTaxData"
          />
        </VWindowItem>
        <VWindowItem>Proyectos</VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
    :message="notificationMessage"
    :color="notificationColor"
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
  <VDialog
    v-model="isDeleteContactDialogVisible"
    width="500"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="isDeleteContactDialogVisible = !isDeleteContactDialogVisible" />

    <!-- Dialog Content -->
    <VCard title="Eliminar contacto">
      <VCardText>
        ¿Estás seguro de eliminar el contacto <b>{{ contact.name }}</b>?
      </VCardText>

      <VCardText class="d-flex justify-end">
        <VBtn @click="deleteContact(contact._id)">
          Eliminar
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
