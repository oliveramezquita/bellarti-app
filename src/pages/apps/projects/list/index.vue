<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'PE',
  },
})

const breadcrumbItems = ref([{ title: 'Proyectos Especiales', class: 'text-primary' }, { title: 'Proyectos' }])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="folders"
  />
</template>
