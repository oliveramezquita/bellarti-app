<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Cuentas',
  },
})

const breadcrumbItems = ref([{ title: 'Cuentas', class: 'text-primary' }])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="cash-register"
  />
</template>
