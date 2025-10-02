<!-- eslint-disable camelcase -->
<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'PE',
    navActiveLink: 'apps-projects-list',
  },
})

const route = useRoute('apps-projects-new-id')
const { data: clientData } = await useApi(`api/client/${ route.params.id }`)

const breadcrumbItems = ref([
  { title: 'Proyectos Especiales', to: { name: 'apps-projects-list' }, class: 'text-underline' },
  { title: clientData.value.name,  to: { name: 'apps-projects-client-id', params: { id: route.params.id } }, class: 'text-underline' },
  { title: 'Nuevo' },
])

const newProject = {
  client_id: route.params.id,
  version: 1,
  name: null,
  front: null,
  location: null,
  payment_method: null,
  method_payment: null,
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    icon="folders"
  />
</template>
