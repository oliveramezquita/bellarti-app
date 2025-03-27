<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'CatBancos',
  },
})

const breadcrumbItems = ref([{ title: 'Catálogos', class: 'text-primary' }, { title: 'Bancos' }])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="files"
  />
</template>
