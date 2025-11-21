export const COOKIE_MAX_AGE_1_YEAR = 365 * 24 * 60 * 60
export const USER_STATUS = [
  {
    title: 'Pendiente',
    value: 0,
  },
  {
    title: 'Activo',
    value: 1,
  },
  {
    title: 'Desactivado',
    value: 2,
  },
]
export const COMMON_STATUS = [
  {
    title: 'Activado',
    value: 1,
  },
  {
    title: 'Desactivado',
    value: 0,
  },
]

export const projectStatusList = [
  { name: 'Diseño', color: 'secondary', icon: 'tabler-color-picker', value: 0 },
  { name: 'Cotización', color: 'warning', icon: 'tabler-cash-register', value: 1 },
  { name: 'Producción', color: 'info', icon: 'tabler-building-factory-2', value: 2 },
  { name: 'Instalación', color: 'primary', icon: 'tabler-package-export', value: 3 },
  { name: 'Entregado', color: 'success', icon: 'tabler-checklist', value: 4 },
]

export const purchaseOrdersDefaultValues = {
  list: { projects: [], companies: [], suppliers: [], purchaseOrders: [], divisions: { values: [] }, paymentMethods: { values: [] }, paymentForms: { values: [] }, cfdi: { values: [] } },
  form: { project: null, company: null, supplier: null, selectedDivisions: [], subject: '', paymentMethod: null, paymentForm: null, cfdi: null, invoiceEmail: 'facturas@bellarti.com.mx', created: new Date(), estimatedDelivery: null, type: 'SP', purchaseOrderNumber: null, linkedOrder: null },
  table: { items: [], totalItems: 0, selectedRows: [], itemsPerPage: 10, page: 1 },
  costs: { subtotal: 0, iva: 0, total: 0 },
}
