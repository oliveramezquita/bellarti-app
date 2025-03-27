<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'CliContactos',
  },
})

const breadcrumbItems = ref([{ title: 'Clientes', class: 'text-primary' }, { title: 'Contactos' }])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="password-user"
  />
</template>
