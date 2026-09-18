<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'ASSeguimiento',
  },
})

const breadcrumbItems = ref([{ title: 'Postventa', class: 'text-primary' }, { title: 'Seguimiento' }])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="device-mobile-message"
  />
  <section>
    Seguimiento
  </section>
</template>
