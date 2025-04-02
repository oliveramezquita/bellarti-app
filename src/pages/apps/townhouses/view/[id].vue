<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'CliVS',
  },
})

const route = useRoute('apps-townhouses-view-id')
const currentTab = ref('tab-1')
const { data: clientData } = await useApi(`api/client/${ route.params.id }`)
</script>

<template>
  <Breadcrumb
    :items="[{ title: 'Clientes', class: 'text-primary' }, { title: 'Vivienda en Serie', to: { name: 'apps-townhouses-list' }, class: 'text-underline' }, { title: clientData.name }]"
    icon="password-user"
  />
  <VCard class="py-3">
    <VTabs
      v-model="currentTab"
      grow
      stacked
    >
      <VTab>
        <VIcon
          icon="tabler-info-circle"
          class="mb-2"
        />
        <span>Información</span>
      </VTab>

      <VTab>
        <VIcon
          icon="tabler-user-dollar"
          class="mb-2"
        />
        <span>Datos Fiscales</span>
      </VTab>

      <VTab>
        <VIcon
          icon="tabler-users"
          class="mb-2"
        />
        <span>Contactos</span>
      </VTab>

      <VTab>
        <VIcon
          icon="tabler-home-search"
          class="mb-2"
        />
        <span>Proyectos</span>
      </VTab>
    </VTabs>

    <VCardText>
      <VWindow v-model="currentTab">
        <VWindowItem
          v-for="i in 4"
          :key="i"
          :value="`tab-${i}`"
        >
          {{ tabItemText }}
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>
