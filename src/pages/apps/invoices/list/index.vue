<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Facturas',
  },
})

const breadcrumbItems = ref([{ title: 'Facturas', class: 'text-primary' }])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="file-invoice"
  />
</template>
