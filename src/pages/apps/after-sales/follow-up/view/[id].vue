<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'ASSeguimiento',
  },
})

const route = useRoute('apps-after-sales-follow-up-view-id')
const { data: followUpInfo } = await useApi(`api/after_sales/follow_up/${ route.params.id }`)

const breadcrumbItems = ref([
  { title: 'Postventa', to: { name: 'apps-after-sales-follow-up-list' }, class: 'text-underline' },
])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    icon="device-mobile-message"
  />
  <section>
    Vista Seguimiento
  </section>
</template>
