<!-- eslint-disable camelcase -->
<script setup>
definePage({
  meta: { action: 'read', subject: 'VSPrototipos' },
})

const route = useRoute('apps-prototypes-view-id')
const { data: prototypeData, execute: fetchPrototype } = await useApi(`api/prototype/${route.params.id}`)

const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const notificationColor = ref('info')

const clients = ref([])
const melamines = ref([])
const granites = ref([])

try {
  const [{ data: clientsList }, { data: melaminesList }, { data: granitesList }] = await Promise.all([
    useApi('api/clients/VS?itemsPerPage=100'),
    useApi('api/catalogs?name=Melamina'),
    useApi('api/catalogs?name=Granito'),
  ])

  clients.value = clientsList.value.data
  melamines.value = melaminesList.value.values ?? []
  granites.value = granitesList.value.values ?? []
} catch (error) {
  isNotificationVisible.value = true
  notificationColor.value = 'error'
  notificationMessage.value = 'Error al cargar los datos iniciales.'
  console.error(error)
}

const breadcrumbItems = ref([
  { title: 'Vivienda en Serie', to: { name: 'apps-prototypes-list' }, class: 'text-underline' },
  { title: 'Prototipo' },
  { title: prototypeData.value.client, to: { name: 'apps-prototypes-list', query: { client_id: prototypeData.value.client_id } }, class: 'text-underline' },
  { title: prototypeData.value.front, to: { name: 'apps-prototypes-list', query: { front: prototypeData.value.front } }, class: 'text-underline' },
  { title: prototypeData.value.name },
])

const tendencies = ref(prototypeData.value.tendencies ?? [])

const addNewTendencie = () => {
  if (totalPercentage.value >= 100) return
  tendencies.value.push({ melamine: null, granite: null, percentage: '' })
}

const totalPercentage = computed(() =>
  tendencies.value.reduce((sum, t) => sum + (parseFloat(t.percentage) || 0), 0),
)

watch(tendencies, newVal => {
  const total = newVal.reduce((sum, t) => sum + (parseFloat(t.percentage) || 0), 0)
  if (total > 100) {
    isNotificationVisible.value = true
    notificationColor.value = 'warning'
    notificationMessage.value = 'El total de porcentajes no puede superar el 100%.'
  }
}, { deep: true })

const saveChanges = async () => {
  if (tendencies.value.some(t => !t.melamine || !t.granite || !t.percentage)) {
    isNotificationVisible.value = true
    notificationColor.value = 'warning'
    notificationMessage.value = 'Completa todos los campos de tendencia antes de guardar.'
    
    return
  }

  if (tendencies.value.length > 0 && totalPercentage.value !== 100) {
    isNotificationVisible.value = true
    notificationColor.value = 'error'
    notificationMessage.value = 'El total de porcentajes debe ser exactamente 100%.'
    
    return
  }

  const data = {
    front: prototypeData.value.front,
    name: prototypeData.value.name,
    tendencies: tendencies.value.length > 0
      ? tendencies.value.map(t => ({
        melamine: t.melamine,
        granite: t.granite,
        percentage: parseFloat(t.percentage) || 0,
      }))
      : null,
  }

  isLoadingDialogVisible.value = true
  try {
    await $api(`api/prototype/${prototypeData.value._id}`, {
      method: 'PATCH',
      body: data,
      onResponse({ response }) {
        isNotificationVisible.value = true
        notificationColor.value = 'success'
        notificationMessage.value = response._data
      },
    })
    fetchPrototype()
  } catch (error) {
    notificationColor.value = 'error'
    notificationMessage.value = error.message
    isNotificationVisible.value = true
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const progressColor = computed(() => {
  if (totalPercentage.value > 100) return 'error'
  if (totalPercentage.value === 100) return 'success'
  
  return 'primary'
})

const remainingPercentage = computed(() => {
  return Math.max(0, 100 - totalPercentage.value)
})

const removeTendencie = i => {
  if (i < 0 || i >= tendencies.value.length) return
  tendencies.value.splice(i, 1)
}
</script>


<template>
  <Breadcrumb
    :items="breadcrumbItems"
    icon="home-stats"
  />
  <VCard class="py-3">
    <VCardItem>
      <VCardTitle>Información</VCardTitle>
    </VCardItem>
    <VCardText>
      <VRow>
        <VCol
          cols="12"
          md="4"
        >
          <AppSelect
            v-model="prototypeData.client_id"
            label="Seleccionar cliente"
            placeholder="Seleccionar cliente"
            :item-title="item => item.name"
            :item-value="item => item._id"
            :items="clients"
            disabled
          />
        </VCol>

        <VCol
          cols="12"
          md="4"
        >
          <AppTextField
            v-model="prototypeData.front"
            label="Frente"
            placeholder="Frente"
          />
        </VCol>

        <VCol
          cols="12"
          md="4"
        >
          <AppTextField
            v-model="prototypeData.name"
            label="Nombre"
            placeholder="Nombre"
          />
        </VCol>
      </VRow>
    </VCardText>
    <VDivider />
    <VCardItem>
      <VCardTitle>Tendencias</VCardTitle>
      <div class="mb-2">
        <div class="text-caption mb-1 text-medium-emphasis">
          <span v-if="totalPercentage < 100">
            Total: {{ totalPercentage.toFixed(1) }} % — Faltan {{ remainingPercentage.toFixed(1) }} %
          </span>
          <span v-else-if="totalPercentage === 100">
            ✅ Total completado: 100 %
          </span>
          <span v-else>
            ⚠️ Total excedido en {{ (totalPercentage - 100).toFixed(1) }} %
          </span>
        </div>

        <VProgressLinear
          :model-value="Math.min(totalPercentage, 100)"
          height="10"
          :color="progressColor"
          :striped="true"
          :rounded="true"
          class="transition-all"
          style="transition-duration: 0.4s;"
        />
      </div>
    </VCardItem>
    <VCardText>
      <VRow
        v-for="(_, i) in tendencies"
        :key="i"
        class="row-table"
        style="margin-inline-start: 0;"
      >
        <VCol
          cols="12"
          md="4"
          class="narrow-column"
        >
          <AppSelect
            v-model="tendencies[i].melamine"
            placeholder="Melamina"
            :items="melamines"
          />
        </VCol>
        <VCol
          cols="12"
          md="4"
          class="narrow-column"
        >
          <AppSelect
            v-model="tendencies[i].granite"
            placeholder="Granito"
            :items="granites"
          />
        </VCol>
        <VCol
          cols="12"
          md="3"
          class="narrow-column"
        >
          <AppTextField
            v-model="tendencies[i].percentage"
            placeholder="Porcentaje"
            suffix="%"
            class="align-right"
          />
        </VCol>
        <VCol
          cols="12"
          md="1"
          class="narrow-column"
        >
          <IconBtn>
            <VIcon
              icon="tabler-circle-minus"
              @click="removeTendencie(i)"
            />
          </IconBtn>
        </VCol>
      </VRow>
      <div :class="tendencies.length > 0 ? 'mt-10': ''">
        <VBtn
          variant="outlined"
          prepend-icon="tabler-plus"
          :disabled="totalPercentage >= 100"
          @click="addNewTendencie"
        >
          Nueva tendencia
        </VBtn>
        <VBtn
          class="ml-3"
          @click="saveChanges"
        >
          Guardar cambios
        </VBtn>
      </div>
    </VCardText>
  </VCard>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
    :color="notificationColor"
    :message="notificationMessage"
  />
</template>

<style lang="scss">
.row-table {
  .v-col-12 {
    padding-block: 1px !important;
  }
}

.narrow-column {
  padding-inline: 1px !important;

  .v-field {
    border-radius: 0 !important;
  }
}

.align-right {
  .v-field__input {
    text-align: end;
  }
}
</style>
