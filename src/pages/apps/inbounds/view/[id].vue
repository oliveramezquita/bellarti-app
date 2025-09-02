<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'AlmEntradas',
  },
})

const route = useRoute('apps-inbounds-view-id')
const router = useRouter()
const { data: inboundData, execute: fetchInbound } = await useApi(`api/inbound/${ route.params.id }`)
const inboundItems = ref(inboundData.value.items)
const notes = ref(inboundData.value?.notes ?? null)
const selectedIds = ref([])
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const isDeleteItemDialogVisible = ref(false)
const selectedItem = ref()
const selectedIndex = ref()

const statusList = [
  { name: 'Registrada', color: 'secondary', icon: 'tabler-package-import', value: 0 },
  { name: 'Almacenada', color: 'success', icon: 'tabler-package-import', value: 1 },
  { name: 'Cancelada', color: 'error', icon: 'tabler-package-import', value: 2 },
]

const getStatusValue = (value, key) => {
  const status = statusList.find(item => item.value === value)
  
  return status ? status[key] : null
}

const allSelected = computed({
  get: () => {
    const items = inboundData.value?.items || []
    
    return items.length > 0 && selectedIds.value.length === items.length
  },
  set: value => {
    if (value) {
      selectedIds.value = (inboundData.value?.items || []).map(item => item.material_id)
    } else {
      selectedIds.value = []
    }
  },
})

const store = async () => {
  const filtered = inboundData.value.items.filter(item => Object.values(selectedIds.value).includes(item.material_id))

  isLoadingDialogVisible.value = true
  try {
    await $api(`api/inbound/${route.params.id}`, {
      method: 'PATCH',
      body: {
        items: filtered,
        status: 1,
        notes: notes.value,
      },
      onResponse({ response }) {
        if (response.status === 200)
          fetchInbound()
        isNotificationVisible.value = true
        notificationMessage.value = response._data
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const cancel = async () => {
  isLoadingDialogVisible.value = true
  try {
    await $api(`api/inbound/${route.params.id}`, {
      method: 'PATCH',
      body: {
        status: 2,
        notes: notes.value,
      },
      onResponse({ response }) {
        if (response.status === 200)
          fetchInbound()
        isNotificationVisible.value = true
        notificationMessage.value = response._data
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const viewDeleteItemDialog = (item, idx) => {
  selectedItem.value = item
  selectedIndex.value = idx
  isDeleteItemDialogVisible.value = true
}

const deleteItem = async idx => {
  const response = await $api(`api/inbound/${route.params.id}?idx=${idx}`, { method: 'DELETE' })

  if (response === 'deleted') {
    nextTick(() => { 
      router.replace(`/apps/inbounds/list`)
    })
  } else {
    isDeleteItemDialogVisible.value = false
    fetchInbound()
    isNotificationVisible.value = true
    notificationMessage.value = response
  }
} 

watch(() => inboundData.value, newVal => {
  inboundItems.value = newVal?.items || []
  selectedIds.value = []
})
</script>

<template>
  <Breadcrumb
    :items="[{ title: 'Almacén', class: 'text-primary' }, { title: 'Entradas', to: { name: 'apps-inbounds-list' }, class: 'text-underline' }, { title: inboundData.folio }]"
    icon="building-warehouse"
  />
  <VCard class="py-3">
    <VCardTitle class="mb-2 d-flex align-center justify-space-between">
      <div>Información</div>
      <VChip :color="getStatusValue(inboundData.status, 'color')">
        <VIcon
          start
          :icon="getStatusValue(inboundData.status, 'icon')"
        />
        {{ getStatusValue(inboundData.status, 'name') }}
      </VChip>
    </VCardTitle>
    <VCardText>
      <VRow>
        <VCol
          cols="12"
          md="6"
        >
          <!-- 👉 Project type -->
          <AppTextField
            :model-value="inboundData.project.type"
            label="Tipo de entrada"
            readonly
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <!-- 👉 Project -->
          <AppTextField
            :model-value="inboundData.project.name"
            label="Proyecto"
            readonly
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <!-- 👉 Supplier -->
          <AppTextField
            :model-value="inboundData.supplier_name"
            label="Proveedor"
            readonly
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <!-- 👉 Purchase order -->
          <AppTextField
            :model-value="inboundData.purchase_order"
            label="Orden de compra"
            readonly
          />
        </VCol>
        <VCol cols="12">
          <!-- 👉 Subject -->
          <AppTextField
            :model-value="notes"
            label="Asunto / Nota / Comentario"
            :readonly="inboundData.status === 1"
          />
        </VCol>
        <VCol
          v-if="supplier"
          cols="12"
        >
          <!-- 👉 Material -->
          <AppAutocomplete
            v-if="supplier"
            v-model="selectedMaterial"
            label="Material"
            :items="materialsList"
            :item-title="item => item.concept"
            :item-value="item => item"
          />
        </VCol>
      </VRow>
    </VCardText>
    <VCardTitle class="mb-2">
      Materiales
    </VCardTitle>
    <VCardText style=" padding-inline: 0;">
      <VTable class="text-no-wrap">
        <thead>
          <tr>
            <th v-if="inboundData.status === 0">
              <VCheckbox v-model="allSelected" />
            </th>
            <th>
              CONCEPTO
            </th>
            <th>
              RACK
            </th>
            <th>
              NIVEL
            </th>
            <th>
              MÓDULO
            </th>
            <th>
              CANTIDAD
            </th>
            <th>
              REQUERIDO
            </th>
            <th>&nbsp;</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(_,i) in inboundItems"
            :key="inboundItems[i]?.material_id"
          >
            <td v-if="inboundData.status === 0">
              <VCheckbox
                :model-value="selectedIds.includes(inboundItems[i].material_id)"
                @update:model-value="checked => {
                  if (checked) {
                    if (!selectedIds.includes(inboundItems[i].material_id)) {
                      selectedIds = [...selectedIds, inboundItems[i].material_id]
                    }
                  } else {
                    selectedIds = selectedIds.filter(id => id !== inboundItems[i].material_id)
                  }
                }"
              />
            </td>
            <td>
              {{ inboundItems[i]?.concept }}
            </td>
            <td>
              <span v-if="inboundData.status === 1">{{ inboundItems[i]?.delivered?.rack }}</span>
              <AppTextField
                v-if="inboundData.status === 0"
                v-model="inboundItems[i].delivered.rack"
                class="quantity-input"
              />
            </td>
            <td>
              <span v-if="inboundData.status === 1">{{ inboundItems[i]?.delivered?.level }}</span>
              <AppTextField
                v-if="inboundData.status === 0"
                v-model="inboundItems[i].delivered.level"
                class="quantity-input"
              />
            </td>
            <td>
              <span v-if="inboundData.status === 1">{{ inboundItems[i]?.delivered?.module }}</span>
              <AppTextField
                v-if="inboundData.status === 0"
                v-model="inboundItems[i].delivered.module"
                class="quantity-input"
              />
            </td>
            <td>
              <span v-if="inboundData.status === 1">{{ inboundItems[i]?.delivered?.quantity }}</span>
              <AppTextField
                v-if="inboundData.status === 0"
                v-model="inboundItems[i].delivered.quantity"
                class="quantity-input"
              />
            </td>
            <td>
              {{ inboundItems[i]?.total_quantity ?? '-' }}
            </td>
            <td>
              <IconBtn @click="viewDeleteItemDialog(inboundItems[i], i)">
                <VIcon icon="tabler-trash" />
              </IconBtn>
            </td>
          </tr>
        </tbody>
      </VTable>
    </VCardText>
    <VCardText>
      <VRow>
        <VCol
          cols="12"
          class="d-flex gap-4 mt-2"
        >
          <VBtn
            v-if="inboundData.status === 0"
            color="primary"
            prepend-icon="tabler-package-import"
            :disabled="selectedIds.length === 0"
            @click="store"
          >
            Almacenar
          </VBtn>
          <VBtn
            v-if="inboundData.status === 0"
            color="error"
            prepend-icon="tabler-x"
            @click="cancel"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="secondary"
            variant="tonal"
            prepend-icon="tabler-arrow-narrow-left"
            :to="{name:'apps-inbounds-list'}"
          >
            Regresar
          </VBtn>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
  <VDialog
    v-model="isDeleteItemDialogVisible"
    width="500"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="isDeleteItemDialogVisible = !isDeleteItemDialogVisible" />

    <!-- Dialog Content -->
    <VCard title="Eliminar material de la entrada">
      <VCardText>
        ¿Estás seguro de eliminar el material <b>{{ selectedItem.concept }}</b>? Al hacerlo, la cantidad registrada se descontará automáticamente del inventario y, si es el único material, la entrada será eliminada por completo.
      </VCardText>

      <VCardText class="d-flex justify-end">
        <VBtn @click="deleteItem(selectedIndex)">
          Eliminar
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
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

.quantity-input {
  input {
    text-align: end;
  }
}
</style>
