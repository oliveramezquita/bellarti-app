<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'PEPlantillas',
  },
})

const breadcrumbItems = ref([{ title: 'Proyectos Especiales', class: 'text-primary' }, { title: 'Plantillas' }])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="folders"
  />
</template>
