<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Materiales',
  },
})

const breadcrumbItems = ref([{ title: 'Materiales', class: 'text-primary' }, { title: 'Materiales' }])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="package"
  />
</template>
