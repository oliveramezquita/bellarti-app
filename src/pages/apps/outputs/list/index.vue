<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'AlmSalidas',
  },
})

const breadcrumbItems = ref([{ title: 'Almacén', class: 'text-primary' }, { title: 'Salidas' }])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="building-warehouse"
  />
</template>
