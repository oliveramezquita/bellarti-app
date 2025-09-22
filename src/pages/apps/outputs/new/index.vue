<!-- eslint-disable camelcase -->
<script setup>
definePage({
  meta: {
    action: 'read',
    notes: 'AlmSalidas',
  },
})

const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const outputTypes = { quantification: 'Cuantificación', originless: 'Sin asignación' }
const outputType = ref()
const { data: clients } = await useApi('api/clients/VS?itemsPerPage=1000')
const { data: supplierList } = await useApi('api/suppliers?itemsPerPage=100')
const { data: divisions } = await useApi('api/catalogs?name=División de materiales')
const client = ref()
const supplier = ref()
const division = ref()
const filters = ref([])
const fronts = ref([])
const front = ref()
const prototypes = ref([])
const prototype = ref()
const areas = ref([])
const area = ref()
const quantification = ref()
const items = ref([])
const totalItems = ref(0)
const enableToRegister = ref(false)
const router = useRouter()
const materials = ref([])
const backupMaterials = ref([])
const material = ref()

const headers = [
  {
    title: '',
    key: 'data-table-expand',
  },
  {
    title: 'Concepto',
    key: 'material.concept',
  },
  {
    title: 'SKU',
    key: 'material.sku',
  },
  {
    title: 'División',
    key: 'material.division',
  },
  {
    title: 'Unidad',
    key: 'material.measurement',
  },
  {
    title: 'Cuantificación',
    key: 'TOTAL',
  },
  {
    title: 'Salida',
    key: 'total_output',
  },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
  },
]

const itemsPerPage = ref(10)
const page = ref(1)

const clientChange = async value => {
  if (value) {
    await $api(`api/quantification-filters?client_id=${value}`, {
      method: 'GET',
      onResponse({ response }) {
        if (response.status === 200) {
          fronts.value = response._data.map(obj => Object.keys(obj)[0])
          filters.value = response._data
        } else {
          isNotificationVisible.value = true
          notificationMessage.value = response._data
          front.value = null
          fronts.value = []
          resetValues(['prototype', 'area', 'items'])
        }
      },
    })
  } else {
    resetValues(['prototype', 'area', 'items'])
  }
}

const frontChange = value => {
  prototypes.value = filters.value.find(obj => obj.hasOwnProperty(value))?.[value]
  prototype.value = null
  resetValues(['area', 'items'])
}

const getQuantification = async () => {
  isLoadingDialogVisible.value = true
  
  try {
    await $api(`api/quantification?client_id=${client.value}&front=${front.value}&prototype=${prototype.value}&get_availability=true`, {
      method: 'GET',
      onResponse({ response }) {
        if (response.status === 200) {
          console.log(response._data)
          quantification.value = response._data
          areas.value = Object.keys(response._data.quantification)
          area.value = null
          items.value = []
        } else {
          isNotificationVisible.value = true
          notificationMessage.value = response._data
          resetValues(['area', 'items'])
        }
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const filterByArea = a => {
  if (quantification.value.quantification.hasOwnProperty(a)) {
    items.value = quantification.value.quantification[a]
    totalItems.value = items.value.length
  }
}

const setOutput = (itemId, availability_id, output) => {
  const parsedOutput = parseFloat(output)

  if (isNaN(parsedOutput)) {
    console.warn(`El valor proporcionado no es un número: ${output}`)
    
    return
  }

  const item = items.value.find(el => el.id === itemId)
  if (!item) return

  const availabilityItem = item.availability.find(av => av._id === availability_id)
  if (availabilityItem)
    availabilityItem.output = parsedOutput 

  item.total_output = item.availability.reduce((sum, av) => sum + parseFloat(av.output || 0), 0)
}

const registerOutput = async () => {
  try {
    await $api('api/outputs', {
      method: 'POST',
      body: {
        client_id: client.value,
        quantification: outputType.value === 'Cuantificación' ? {
          id: quantification.value._id,
          front: front.value,
          prototype: prototype.value,
          area: area.value,
        } : 'Sin asignación',
        outputs: items.value,
      },
      onResponse({ response }) {
        if (response.status === 201) {
          nextTick(() => { 
            router.replace(`/apps/outputs/view/${response._data.id}?new=true`)
          })
        } else {
          isNotificationVisible.value = true
          notificationMessage.value = response._data
        }
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const resetValues = values => {
  if (values.includes('prototype')) {
    prototype.value = null
    prototypes.value = []
  }
  if (values.includes('area')) {
    area.value = null
    areas.value = []
  }
  if (values.includes('items')) 
    items.value = []
}

const getMaterials = async s => {
  const { data: materialsReponse } = await useApi(`api/inventory?available=true&supplier=${s}&itemsPerPage=1000`)

  backupMaterials.value = materialsReponse.value.data 
  materials.value = backupMaterials.value
}

const filterMaterials = () => {
  if (division.value) {
    const leakedMaterials = materials.value.filter(item => item.material.division === division.value)

    materials.value = leakedMaterials
  } else {
    materials.value = backupMaterials.value
  }
}

const fillItems = item => {
  const isExist = items.value.some(i => i.id === item.material.id)

  if (!isExist) {
    items.value.push({
      id: item.material.id,
      material: {
        concept: item.material.concept,
        measurement: item.material.measurement,
        sku: item.material.sku,
        division: item.material.division,
      },
      availability: item.hasOwnProperty('availability') ? item.availability : [],
      TOTAL: '-',
      total_output: 0,
    })
    totalItems.value = items.value.length
    material.value = null
  }
}

const removeItem = itemId => {
  const result = items.value.filter(item => item.id !== itemId)

  items.value = result
}

watchEffect(() => {
  enableToRegister.value = items.value.some(item => item.total_output > 0)
})
</script>

<template>
  <Breadcrumb
    :items="[{ title: 'Almacén', class: 'text-primary' }, { title: 'Salidas', to: { name: 'apps-outputs-list' }, class: 'text-underline' }, { title: 'Nueva salida' }]"
    icon="building-warehouse"
  />
  <VCard class="py-3">
    <VCardTitle class="mb-2">
      Información
    </VCardTitle>
    <VCardText class="d-flex align-center justify-space-between py-4">
      <VRow>
        <VCol
          cols="12"
          md="4"
        >
          <!-- 👉 Output type -->
          <AppSelect
            v-model="outputType"
            label="Tipo de salida"
            placeholder="Seleccionar tipo de salida"
            :items="Object.values(outputTypes)"
            clearable
            clear-icon="tabler-x"
          />
        </VCol>
        <!-- 👉 Clients -->
        <VCol
          v-if="outputType === 'Cuantificación'"
          cols="12"
          md="4"
        >
          <AppAutocomplete
            v-model="client"
            label="Ciente"
            placeholder="Seleccionar cliente"
            :item-title="item => item.name"
            :item-value="item => item._id"
            :items="clients.data"
            :disabled="outputType !== 'Cuantificación'"
            class="font-weight-bold"
            @update:model-value="clientChange"
          />
        </VCol>
        <!-- 👉 Fronts -->
        <VCol
          v-if="outputType === 'Cuantificación'"
          cols="12"
          md="4"
        >
          <AppSelect
            v-model="front"
            label="Frente / Fraccionamiento"
            placeholder="Seleccionar frente/fraccionamiento"
            :items="fronts"
            :disabled="fronts.length === 0"
            class="font-weight-bold"
            @update:model-value="frontChange"
          />
        </VCol>
        <!-- 👉 Prototypes -->
        <VCol
          v-if="outputType === 'Cuantificación'"
          cols="12"
          md="4"
        >
          <AppSelect
            v-model="prototype"
            label="Prototipo"
            placeholder="seleccionar prototipo"
            :items="prototypes"
            :disabled="prototypes.length === 0"
            class="font-weight-bold"
            @update:model-value="getQuantification"
          />
        </VCol>
        <!-- 👉 Areas -->
        <VCol
          v-if="outputType === 'Cuantificación'"
          cols="12"
          md="4"
        >
          <AppSelect
            v-model="area"
            label="Área"
            placeholder="Seleccionar área"
            :items="areas"
            :disabled="areas.length === 0"
            class="font-weight-bold"
            @update:model-value="filterByArea"
          />
        </VCol>
        <!-- 👉 Supplier -->
        <VCol
          v-if="outputType === 'Sin asignación'"
          cols="12"
          md="4"
        >
          <AppAutocomplete
            v-model="supplier"
            label="Proveedor"
            placeholder="Seleccionar proveedor"
            :items="supplierList.data"
            :item-title="item => item.name"
            :item-value="item => item._id"
            @update:model-value="getMaterials"
          />
        </VCol>
        <!-- 👉 Division -->
        <VCol
          v-if="outputType === 'Sin asignación'"
          cols="12"
          md="4"
        >
          <AppSelect
            v-model="division"
            label="División"
            :items="divisions.values"
            clearable
            clear-icon="tabler-x"
            @update:model-value="filterMaterials"
          />
        </VCol>
        <VCol
          v-if="outputType"
          cols="12"
        >
          <!-- 👉 Notes -->
          <AppTextField
            v-model="notes"
            label="Asunto / Nota / Comentario"
            placeholder="Añadir asunto, nota o comentario"
          />
        </VCol>
        <VCol
          v-if="supplier"
          cols="12"
        >
          <!-- 👉 Material -->
          <AppAutocomplete
            v-if="supplier && outputType === 'Sin asignación'"
            v-model="material"
            label="Material"
            :items="materials"
            :item-title="item => item.material.concept"
            :item-value="item => item"
            @update:model-value="fillItems"
          />
        </VCol>
      </VRow>
    </VCardText>
    <VCardTitle v-if="items.length > 0">
      Materiales
    </VCardTitle>
    <VCardText
      v-if="items.length > 0"
      style="padding: 0;"
    >
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items-per-page-options="[
          { value: 10, title: '10' },
          { value: 20, title: '20' },
          { value: 50, title: '50' },
          { value: -1, title: '$vuetify.dataFooter.itemsPerPageAll' },
        ]"
        :items="items"
        :items-length="totalItems"
        :headers="headers"
        class="text-no-wrap"
        expand-on-click
        @update:options="updateOptions"
      >
        <template #expanded-row="slotProps">
          <tr class="v-data-table__tr">
            <td
              :colspan="headers.length"
              style="padding-block-end: 30px;"
            >
              <h4 class="mt-3">
                Inventario:
              </h4>
              <VRow
                style="margin-inline-start: 0;"
                class="mt-2"
              >
                <VCol
                  cols="12"
                  md="4"
                  class="narrow-column"
                >
                  PROYECTO
                </VCol>
                <VCol
                  cols="12"
                  md="2"
                  class="narrow-column"
                >
                  RACK
                </VCol>
                <VCol
                  cols="12"
                  md="2"
                  class="narrow-column"
                >
                  NIVEL
                </VCol>
                <VCol
                  cols="12"
                  md="2"
                  class="narrow-column"
                >
                  MÓDULO
                </VCol>
                <VCol
                  cols="12"
                  md="1"
                  class="narrow-column"
                >
                  CANTIDAD
                </VCol>
                <VCol
                  cols="12"
                  md="1"
                  class="narrow-column"
                >
                  SALIDA
                </VCol>
              </VRow>
              <VRow
                v-for="ava in slotProps.item.availability"
                :key="ava._id"
                class="row-table"
              >
                <VCol
                  cols="12"
                  md="4"
                  class="narrow-column"
                >
                  <!-- 👉 Project -->
                  <AppTextField
                    v-model="ava.project.name"
                    placeholder="Proyecto"
                    disabled
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="2"
                  class="narrow-column"
                >
                  <!-- 👉 Rack -->
                  <AppTextField
                    v-model="ava.rack"
                    placeholder="Rack"
                    disabled
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="2"
                  class="narrow-column"
                >
                  <!-- 👉 Level -->
                  <AppTextField
                    v-model="ava.level"
                    placeholder="Nivel"
                    disabled
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="2"
                  class="narrow-column"
                >
                  <!-- 👉 Module -->
                  <AppTextField
                    v-model="ava.module"
                    placeholder="Módulo"
                    disabled
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="1"
                  class="narrow-column"
                >
                  <!-- 👉 Quantity -->
                  <AppTextField
                    v-model="ava.quantity"
                    placeholder="Cantidad"
                    disabled
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="1"
                  class="narrow-column"
                >
                  <!-- 👉 Output -->
                  <AppTextField
                    v-model="ava.output"
                    placeholder="Salida"
                    @update:model-value="value => {
                      const num = Math.min(Number(value), ava.quantity);
                      ava.output = num;
                      setOutput(slotProps.item.id, ava._id, num);
                    }"
                  />
                </VCol>
              </VRow>
            </td>
          </tr>
        </template>
        <template #item.total_output="{ item }">
          <b>{{ item.total_output }}</b>
        </template>
        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn @click="removeItem(item.id)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>
      </VDataTableServer>
    </VCardText>
    <VCardText
      v-if="totalItems > 0"
      class="mt-5"
    >
      <VRow>
        <VCol
          cols="12"
          class="d-flex gap-4"
        >
          <VBtn
            :disabled="!enableToRegister"
            @click="registerOutput"
          >
            Guardar
          </VBtn>

          <VBtn
            color="secondary"
            variant="tonal"
            :to="{name:'apps-outputs-list'}"
          >
            Regresar
          </VBtn>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
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
</style>
