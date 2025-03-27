<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'CliPE',
  },
})

const breadcrumbItems = ref([{ title: 'Clientes', class: 'text-primary' }, { title: 'Proyectos Especiales' }])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="password-user"
  />
</template>
