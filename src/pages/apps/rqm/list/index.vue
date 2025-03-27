<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'RQM',
  },
})

const breadcrumbItems = ref([{ title: 'RQM', class: 'text-primary' }])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="checkup-list"
  />
</template>
