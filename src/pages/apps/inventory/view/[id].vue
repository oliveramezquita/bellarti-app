<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'AlmInventario',
    navActiveLink: 'apps-inventory-list',
  },
})

const route = useRoute('apps-inventory-view-id')
const router = useRouter()
</script>

<template>
  <Breadcrumb
    :items="[{ title: 'Almacén', class: 'text-primary' }, { title: 'Inventario', to: { name: 'apps-inventory-list' }, class: 'text-underline' }, { title: '' }]"
    icon="building-warehouse"
  />
</template>
