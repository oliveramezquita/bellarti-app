<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Proveedores',
  },
})

const breadcrumbItems = ref([{ title: 'Proveedores', class: 'text-primary' }])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="users"
  />
</template>
