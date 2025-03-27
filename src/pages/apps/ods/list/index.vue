<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'VSODs',
  },
})

const breadcrumbItems = ref([{ title: 'Vivienda en Serie', class: 'text-primary' }, { title: `OD's` }])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="home-stats"
  />
</template>
