<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'AdmSecciones',
  },
})

const breadcrumbItems = ref([{ title: 'Administración', class: 'text-primary' }, { title: 'Secciones' }])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="settings"
  />
</template>
