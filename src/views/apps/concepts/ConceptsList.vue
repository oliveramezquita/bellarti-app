<!-- eslint-disable camelcase -->
<script setup>
const props = defineProps({
  concepts: {
    type: Object,
    required: false,
    default: () => ({
      data: [],
      total_elements: 0,
    }),
  },
  projectStatus: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['update:concepts', 'update:projectStatus', 'deleteConcept'])

const concepts = ref(structuredClone(toRaw(props.concepts.data)))
const totalConcepts = ref(props.concepts.total_elements)

const headers = [
  { title: 'Concepto', key: 'name' },
  { title: 'Indirectos', key: 'indirect' },
  { title: 'Subtotal', key: 'subtotal' },
  { title: 'IVA', key: 'iva' },
  { title: 'TOTAL', key: 'total' },
]

if (props.projectStatus < 2)
  headers.push({ title: 'Acciones', key: 'actions', sortable: false })

const itemsPerPage = ref(10)
const page = ref(1)

const viewDeleteConceptDialog = concept => emit('deleteConcept', concept)

watch(
  () => props.concepts,
  newValue => {
    concepts.value = Array.isArray(newValue?.data)
      ? structuredClone(toRaw(newValue.data))
      : []
    totalConcepts.value = newValue?.total_elements ?? 0
  },
  { deep: true },
)
</script>


<template>
  <div
    class="mb-4"
    style=" margin-block-start: -24px;padding-inline: 24px;"
  >
    <div class="d-flex gap-2 align-center">
      <p class="text-body-1 mb-0">
        Mostrar
      </p>
      <AppSelect
        :model-value="itemsPerPage"
        :items="[
          { value: 10, title: '10' },
          { value: 25, title: '25' },
          { value: 50, title: '50' },
          { value: 100, title: '100' },
        ]"
        style="inline-size: 5.5rem;"
        @update:model-value="itemsPerPage = parseInt($event, 10)"
      />
    </div>
  </div>
  <VDataTableServer
    v-model:items-per-page="itemsPerPage"
    v-model:page="page"
    :items-per-page-options="[
      { value: 10, title: '10' },
      { value: 20, title: '20' },
      { value: 50, title: '50' },
      { value: -1, title: '$vuetify.dataFooter.itemsPerPageAll' },
    ]"
    :items="concepts"
    :items-length="totalConcepts"
    :headers="headers"
    class="text-no-wrap"
    @update:options="updateOptions"
  >
    <template #item.name="{ item }">
      <div class="d-flex gap-x-4">
        <div class="d-flex flex-column">
          <h6
            class="text-base"
            style="font-weight: normal;"
          >
            <RouterLink
              :to="{ name: 'apps-concepts-id', params: { id: item._id } }"
              class="font-weight-medium text-link"
            >
              {{ item.name }}
            </RouterLink>
          </h6>
        </div>
      </div>
    </template>
    <template #item.indirect="{ item }">
      {{ item.indirect ? `${item.indirect}%` : '' }}
    </template>
    <template #item.subtotal="{ item }">
      {{ formatNumber(item.subtotal) }}
    </template>
    <template #item.iva="{ item }">
      {{ formatNumber(item.iva) }}
    </template>
    <template #item.total="{ item }">
      {{ formatNumber(item.total) }}
    </template>
    <template #item.actions="{ item }">
      <IconBtn @click="viewDeleteConceptDialog(item)">
        <VIcon icon="tabler-trash" />
      </IconBtn>
    </template>
    <template #bottom>
      <TablePagination
        v-model:page="page"
        :items-per-page="itemsPerPage"
        :total-items="totalConcepts"
      />
    </template>
  </VDataTableServer>
</template>

<style lang="scss">
.text-link {
  text-decoration: underline;
}
</style>
