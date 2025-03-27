<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'VSVolumetria',
  },
})

const breadcrumbItems = ref([{ title: 'Vivienda en Serie', class: 'text-primary' }, { title: 'Volumetría' }])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="home-stats"
  />
</template>
