<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'AdmUsuarios',
  },
})
import UserBioPanel from '@/views/apps/user/view/UserBioPanel.vue'
import UserTabAccount from '@/views/apps/user/view/UserTabAccount.vue'
import UserTabPermissions from '@/views/apps/user/view/UserTabPermissions.vue'

const route = useRoute('apps-user-view-id')
const userTab = ref(null)

const tabs = [
  {
    icon: 'tabler-users',
    title: 'Permisos de usuario',
  },
  {
    icon: 'tabler-lock',
    title: 'Historial del usuario',
  },
]

const { data: userData } = await useApi(`api/user/${ route.params.id }`)
const { data: rolesList } = await useApi('api/roles?itemsPerPage=100')
</script>

<template>
  <VRow v-if="userData">
    <VCol cols="12">
      <VCard>
        <VCardText class="d-flex align-center justify-space-between py-3">
          <VBreadcrumbs
            class="px-0 pb-0 pt-0 help-center-breadcrumbs"
            :items="[{ title: 'Usuarios', to: { name: 'apps-user-list' }, class: 'text-primary' }, { title: userData.full_name }]"
          />
          <VBtn
            color="secondary"
            variant="tonal"
            @click="$router.go(-1)"
          >
            <VIcon
              start
              icon="tabler-arrow-left"
            />
            Regresar
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
    <VCol
      cols="12"
      md="5"
      lg="4"
    >
      <UserBioPanel
        v-model:roles-list="rolesList.data"
        :user-data="userData"
      />
    </VCol>

    <VCol
      cols="12"
      md="7"
      lg="8"
    >
      <VTabs
        v-model="userTab"
        class="v-tabs-pill"
      >
        <VTab
          v-for="tab in tabs"
          :key="tab.icon"
        >
          <VIcon
            :size="18"
            :icon="tab.icon"
            class="me-1"
          />
          <span>{{ tab.title }}</span>
        </VTab>
      </VTabs>

      <VWindow
        v-model="userTab"
        class="mt-6 disable-tab-transition"
        :touch="false"
      >
        <VWindowItem>
          <UserTabPermissions v-model:user-data="userData" />
        </VWindowItem>

        <VWindowItem>
          <UserTabAccount />
        </VWindowItem>
      </VWindow>
    </VCol>
  </VRow>
  <div v-else>
    <VAlert
      type="error"
      variant="tonal"
    >
      Invoice with ID  {{ route.params.id }} not found!
    </VAlert>
  </div>
</template>
