<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'MatEquipamiento',
  },
})

const breadcrumbItems = ref([{ title: 'Materiales', class: 'text-primary' }, { title: 'Equipamiento y Accesorios' }])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="package"
  />
</template>
