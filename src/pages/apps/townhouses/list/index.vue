<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'CliVS',
  },
})

const breadcrumbItems = ref([{ title: 'Clientes', class: 'text-primary' }, { title: 'Vivienda en Serie' }])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="password-user"
  />
</template>
