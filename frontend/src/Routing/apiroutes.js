



export const API_ROUTES = {
  TOKEN: "/token/",
  TOKEN_REFRESH: "/token/refresh/",
  INVOICES: "/invoices/",
  INVOICE_PAYMENT: (id) => `/invoices/${id}/payment/`,
  INVOICE_DETAIL: (id) => `/invoices/${id}/`,
  PAYMENTS: "/payments/",
  CUSTOMERS: "/customers/",
  CUSTOMER_DETAIL: (id) => `/customers/${id}/`,
  SERVICES: "/services/",
  SERVICE_DETAIL: (id) => `/services/${id}/`,
  USER_ME: "/users/me/",
  PERMISSIONS: "/permissions/",
  GROUPS: "/groups/",
  GROUP_CREATE: "/groups/create/",
  GROUP_DETAIL: (id) => `/groups/${id}/`,
  SEND_EMAIL: "/send-email/",
};
