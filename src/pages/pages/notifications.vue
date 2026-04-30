<!-- eslint-disable camelcase -->
<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Notificaciones',
  },
})

const breadcrumbItems = ref([{ title: 'Notificaciones', class: 'text-primary' }])
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

const {
  data: notificationsData,
  execute: fetchNotifications,
} = await useApi(createUrl('api/notifications', {
  query: {
    q: searchQuery,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
  },
}))
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="bell"
  />
  <section>
    &nbsp;
  </section>
</template>
