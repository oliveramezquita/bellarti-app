<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'VSPrototipos',
  },
})

const breadcrumbItems = ref([{ title: 'Vivienda en Serie', class: 'text-primary' }, { title: 'Prototipos' }])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="home-stats"
  />
</template>
