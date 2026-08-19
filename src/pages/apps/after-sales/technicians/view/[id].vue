<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'ASTecnicos',
  },
})

const route = useRoute('apps-after-sales-technicians-view-id')
const { data: technicianInfo } = await useApi(`api/after_sales/technicians/${ route.params.id }`)

const breadcrumbItems = ref([
  { title: 'Postventa', to: { name: 'apps-after-sales-technicians-list' }, class: 'text-underline' },
  { title: technicianInfo.value.name },
])
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    icon="device-mobile-message"
  />
  <section>
    Vista Técnicos
  </section>
</template>
