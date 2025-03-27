<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'AdminDashboard',
  },
})
import AnalyticsStatusUsersOverview from '@/views/dashboards/admin/AnalyticsStatusUsersOverview.vue'

const userData = useCookie('userData')
</script>

<template>
  <div>
    <VRow class="py-6">
      <!-- 👉 Welcome -->
      <VCol
        cols="12"
        md="8"
        :class="$vuetify.display.mdAndUp ? 'border-e' : 'border-b'"
      >
        <div class="pe-3">
          <h5 class="text-h5 mb-2">
            Bienvenido de nuevo, <span class="text-h5"> {{ userData.full_name }} 👋🏻 </span>
          </h5>

          <div
            class="text-wrap text-body-1"
            style="max-inline-size: 360px;"
          >
            Integrante desde 01 de Marzo de 2025
          </div>
        </div>
      </VCol>
      <VCol
        cols="12"
        md="4"
      >
        <div class="d-flex justify-space-between align-center">
          <div class="d-flex flex-column ps-3">
            <h5 class="text-h5 mb-1 text-no-wrap">
              Última conexión
            </h5>
            <div class="text-body-1 mb-7">
              Jueves 27 de Marzo, 15:01:00
            </div>
          </div>
        </div>
      </VCol>
    </VRow>
    <VRow class="match-height">
      <VCol
        cols="12"
        sm="6"
        lg="4"
      >
        <AnalyticsStatusUsersOverview />
      </VCol>
    </VRow>
  </div>
</template>
