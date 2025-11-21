<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'CliContactos',
  },
})
import { defineAsyncComponent } from 'vue'

const NewContactFormDrawer  = defineAsyncComponent(() => import('@/views/apps/contacts/NewContactFormDrawer.vue'))
const EditContactFormDrawer = defineAsyncComponent(() => import('@/views/apps/contacts/EditContactFormDrawer.vue'))
const breadcrumbItems = ref([{ title: 'Clientes', class: 'text-primary' }, { title: 'Contactos' }])
const isAddContactFormDrawerVisible = ref(false)
const isEditContactFormDrawerVisible = ref(false)
const isDeleteContactDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const notificationColor = ref('info')
const isLoadingDialogVisible = ref(false)
const search = ref('')
const selectedContact = ref()

const {
  data: contacts,
  execute: fetchContacts,
} = await useApi(createUrl('api/contacts'))

const headers = [
  {
    title: 'Nombre',
    key: 'name',
  },
  {
    title: 'Correo electrónico',
    key: 'email',
    ortable: false,
  },
  {
    title: 'Teléfono',
    key: 'phone',
    ortable: false,
  },
  {
    title: 'Ciente',
    key: 'client.name',
  },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
  },
]

const saveContact = async contact => {
  const clientId = contact.client_id

  const filtered = Object.fromEntries(
    Object.entries(contact).filter(([key, _]) => key !== 'client_id'),
  )

  isLoadingDialogVisible.value = true

  try {
    await $api(`api/contacts/${ clientId }`, {
      method: 'POST',
      body: filtered,
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

const viewEditContactDrawer = contact => {
  selectedContact.value = contact
  isEditContactFormDrawerVisible.value = true
}

const updateContact = async contact => {
  const clientId = contact.client_id

  const filtered = Object.fromEntries(
    Object.entries(contact).filter(([key, _]) => key !== 'client_id' && key !== 'client' && key !== '_id'),
  )

  isLoadingDialogVisible.value = true

  try {
    await $api(`api/contact/${ clientId }`, {
      method: 'PATCH',
      body: filtered,
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

const viewDeleteContactDialog = contact => {
  selectedContact.value = contact
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
    :return="false"
    icon="password-user"
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
            @click="isAddContactFormDrawerVisible = true"
          >
            Agregar contacto
          </VBtn>
        </div>
      </VCardText>

      <VDivider />
      
      <VDataTable
        :headers="headers"
        :items="contacts"
        :items-per-page="10"
        :search="search"
      >
        <template #item.actions="{ item }">
          <IconBtn @click="viewEditContactDrawer(item)">
            <VIcon icon="tabler-pencil" />
          </IconBtn> 
            
          <IconBtn @click="viewDeleteContactDialog(item)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>
      </VDataTable>
    </VCard>
  </section>
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
    v-model:contact-info="selectedContact"
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
        ¿Estás seguro de eliminar el contacto <b>{{ selectedContact.name }}</b>?
      </VCardText>

      <VCardText class="d-flex justify-end">
        <VBtn @click="deleteContact(selectedContact._id)">
          Eliminar
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
