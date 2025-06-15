
export const environment = {
  production: true,
  apiUrl: 'https://apis.avisonline.store/api',
  adminPanelUrl: 'https://www.admin.avisonline.store',
  appName: 'AvisOnline',
  version: '1.0.0',
  features: {
    enableSSR: true,
    enablePWA: false,
    enableAnalytics: false,
    enableErrorLogging: false
  },
  pagination: {
    defaultPageSize: 12,
    maxPageSize: 100
  },
  images: {
    maxUploadSize: 5 * 1024 * 1024, // 5MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    defaultPlaceholder: '/assets/images/no-image.jpg'
  },
  cache: {
    announcements: 5 * 60 * 1000, // 5 minutos
    categories: 10 * 60 * 1000, // 10 minutos
  },
  emailjs: {
    publicKey: 'XMWo5duRMq2QDyfur',
    serviceId: 'service_vxbzsoq',
    templateId: 'template_c4cp9nl'
  },

     URL_TIENDA: 'https://www.avisonline.store',
}; 