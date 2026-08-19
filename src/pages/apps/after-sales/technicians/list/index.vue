<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'ASTecnicos',
  },
})

const breadcrumbItems = ref([{ title: 'Postventa', class: 'text-primary' }, { title: 'Técnicos' }])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="device-mobile-message"
  />
  <section>
    Técnicos
  </section>
</template>
