<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'PE',
  },
})

const breadcrumbItems = ref([{ title: 'Proyectos Especiales', class: 'text-primary' }, { title: 'Proyectos' }])
const { data: clientList } = await useApi('api/projects/clients')
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="folders"
  />
  <VRow class="match-height">
    <VCol
      v-for="client in clientList"
      :key="client._id"
      cols="12"
      md="4"
    >
      <VCard>
        <VCardItem>
          <VCardTitle>
            <RouterLink
              :to="{ name: 'apps-projects-client-id', params: { id: client._id } }"
              class="font-weight-medium text-link"
            >
              {{ `C${client.pe_id} - ${client.name}` }}
            </RouterLink>
          </VCardTitle>
          <VCardSubtitle>
            {{ client.total_projects }} Proyecto(s)
          </VCardSubtitle>
        </VCardItem>

        <VCardText>
          <VList class="card-list">
            <VListItem
              v-for="projectData in client.project_data"
              :key="projectData.id"
            >
              <template #prepend>
                <VAvatar
                  :color="projectData.color"
                  variant="tonal"
                  size="34"
                  rounded
                  class="me-1"
                >
                  <VIcon
                    :icon="projectData.icon"
                    size="22"
                  />
                </VAvatar>
              </template>

              <VListItemTitle class="font-weight-medium me-4">
                {{ projectData.title }}
              </VListItemTitle>

              <template #append>
                <div class="d-flex gap-x-4">
                  <div class="text-body-1">
                    {{ projectData.count }}
                  </div>
                </div>
              </template>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
.text-link {
  text-decoration: underline;
}
</style>
