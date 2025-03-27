<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'OC',
  },
})

const breadcrumbItems = ref([{ title: 'Órdenes de Compra', class: 'text-primary' }])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="credit-card-pay"
  />
</template>
