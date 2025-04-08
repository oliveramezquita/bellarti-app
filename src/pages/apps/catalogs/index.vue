<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Catalogos',
  },
})

const breadcrumbItems = ref([{ title: 'Catálogos', class: 'text-primary' }])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="files"
  />
</template>
