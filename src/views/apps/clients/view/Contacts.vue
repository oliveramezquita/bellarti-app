<script setup>
const props = defineProps({
  contactsInfo: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits([
  'update:contactsInfo',
  'contactData',
  'updateContactData',
  'deleteContactData',
])

const contacts = ref(props.contactsInfo ? structuredClone(toRaw(props.contactsInfo)) : [])

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
    title: 'Acciones',
    key: 'actions',
    sortable: false,
  },
]

const updateContact = data => {
  emit('updateContactData', data)
}

const deleteContact = data => {
  emit('deleteContactData', data)
}

watch(() => props.contactsInfo, newValue => {
  contacts.value = structuredClone(toRaw(newValue))
})
</script>

<template>
  <div style="padding-block: 24px;padding-inline: 0;">
    <div
      class="d-flex flex-wrap gap-4 justify-end mb-6"
      style="padding-inline-end: 24px;"
    >
      <div class="d-flex flex-wrap gap-4">
        <VBtn
          prepend-icon="tabler-plus"
          @click="emit('contactData')"
        >
          Añadir Contacto
        </VBtn>
      </div>
    </div>

    <VDivider />
      
    <VDataTable
      :headers="headers"
      :items="contacts"
      :items-per-page="10"
    >
      <template #item.actions="{ item }">
        <IconBtn @click="updateContact(item)">
          <VIcon icon="tabler-pencil" />
        </IconBtn> 
          
        <IconBtn @click="deleteContact(item)">
          <VIcon icon="tabler-trash" />
        </IconBtn>
      </template>
    </VDataTable>
  </div>
</template>
