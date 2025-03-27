<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'EC',
  },
})

const breadcrumbItems = ref([{ title: 'Empleados y Colaboradores', class: 'text-primary' }])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="users-group"
  />
</template>
