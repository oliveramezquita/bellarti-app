<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'AlmEntradas',
  },
})

const route = useRoute('apps-inbounds-view-id')
const router = useRouter()
const protectTypes = ['Vivienda en Serie', 'Proyecto Especial', 'Sin proyecto']
</script>

<template>
  <Breadcrumb
    :items="[{ title: 'Almacén', class: 'text-primary' }, { title: 'Entradas', to: { name: 'apps-inbounds-list' }, class: 'text-underline' }, { title: '' }]"
    icon="building-warehouse"
  />
  <VCard class="py-3">
    <VCardText>
      <VRow>
        <VCol
          cols="12"
          md="6"
        >
          <!-- 👉 Project type -->
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <!-- 👉 Project -->
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <!-- 👉 Supplier -->
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <!-- 👉 Material -->
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
