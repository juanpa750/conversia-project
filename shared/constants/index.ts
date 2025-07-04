// 🏗️ CONSTANTES COMPARTIDAS - CONVERSIA

// ===============================
// 🔐 ROLES DE USUARIO
// ===============================
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user',
  VIEWER: 'viewer'
} as const;

export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: ['*'],
  [USER_ROLES.ADMIN]: ['manage_users', 'manage_chatbots', 'manage_integrations', 'view_analytics', 'manage_billing'],
  [USER_ROLES.USER]: ['manage_chatbots', 'manage_integrations', 'view_analytics'],
  [USER_ROLES.VIEWER]: ['view_chatbots', 'view_analytics']
} as const;

// ===============================
// 💳 PLANES DE SUSCRIPCIÓN
// ===============================
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
} as const;

export const PLAN_LIMITS = {
  [SUBSCRIPTION_TIERS.FREE]: {
    chatbots: 1,
    whatsappNumbers: 1,
    monthlyMessages: 100,
    contacts: 50,
    aiResponses: 50
  },
  [SUBSCRIPTION_TIERS.BASIC]: {
    chatbots: 3,
    whatsappNumbers: 2,
    monthlyMessages: 1000,
    contacts: 500,
    aiResponses: 500
  },
  [SUBSCRIPTION_TIERS.PRO]: {
    chatbots: 10,
    whatsappNumbers: 5,
    monthlyMessages: 10000,
    contacts: 5000,
    aiResponses: 5000
  },
  [SUBSCRIPTION_TIERS.ENTERPRISE]: {
    chatbots: -1, // unlimited
    whatsappNumbers: -1, // unlimited
    monthlyMessages: -1, // unlimited
    contacts: -1, // unlimited
    aiResponses: -1 // unlimited
  }
} as const;

// ===============================
// 🤖 CHATBOT CONFIG
// ===============================
export const AI_PERSONALITIES = {
  PROFESSIONAL: 'professional',
  FRIENDLY: 'friendly',
  CASUAL: 'casual',
  ENTHUSIASTIC: 'enthusiastic'
} as const;

export const CONVERSATION_OBJECTIVES = {
  SALES: 'sales',
  SUPPORT: 'support',
  INFORMATION: 'information',
  APPOINTMENT: 'appointment'
} as const;

export const CHATBOT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  ARCHIVED: 'archived'
} as const;

// ===============================
// 📱 WHATSAPP
// ===============================
export const WHATSAPP_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error'
} as const;

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  DOCUMENT: 'document',
  VOICE: 'voice',
  VIDEO: 'video'
} as const;

export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed'
} as const;

// ===============================
// 👥 CRM
// ===============================
export const LEAD_STAGES = {
  COLD: 'cold',
  WARM: 'warm',
  HOT: 'hot',
  QUALIFIED: 'qualified',
  CUSTOMER: 'customer',
  LOST: 'lost'
} as const;

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

export const CONTACT_SOURCES = {
  WHATSAPP: 'whatsapp',
  MANUAL: 'manual',
  IMPORT: 'import',
  API: 'api'
} as const;

export const CONVERSATION_STATUS = {
  ACTIVE: 'active',
  RESOLVED: 'resolved',
  ARCHIVED: 'archived'
} as const;

export const SENTIMENT_TYPES = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
  NEUTRAL: 'neutral'
} as const;

// ===============================
// 📊 ANALYTICS
// ===============================
export const DATE_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  LAST_90_DAYS: 'last_90_days',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  CUSTOM: 'custom'
} as const;

export const METRIC_TYPES = {
  TOTAL_CONTACTS: 'total_contacts',
  NEW_CONTACTS: 'new_contacts',
  ACTIVE_CONVERSATIONS: 'active_conversations',
  CONVERSION_RATE: 'conversion_rate',
  RESPONSE_TIME: 'response_time',
  CUSTOMER_SATISFACTION: 'customer_satisfaction'
} as const;

// ===============================
// 🔔 NOTIFICACIONES
// ===============================
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success'
} as const;

// ===============================
// 🌐 IDIOMAS SOPORTADOS
// ===============================
export const SUPPORTED_LANGUAGES = {
  ES: 'es',
  EN: 'en',
  PT: 'pt',
  FR: 'fr'
} as const;

export const LANGUAGE_NAMES = {
  [SUPPORTED_LANGUAGES.ES]: 'Español',
  [SUPPORTED_LANGUAGES.EN]: 'English',
  [SUPPORTED_LANGUAGES.PT]: 'Português',
  [SUPPORTED_LANGUAGES.FR]: 'Français'
} as const;

// ===============================
// 🕐 CONFIGURACIÓN DE TIEMPO
// ===============================
export const TIMEZONE_OPTIONS = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'America/Argentina/Buenos_Aires',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney'
] as const;

// ===============================
// 📁 TIPOS DE ARCHIVO
// ===============================
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  DOCUMENTS: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
  AUDIO: ['mp3', 'wav', 'ogg', 'm4a'],
  VIDEO: ['mp4', 'mov', 'avi', 'webm']
} as const;

export const MAX_FILE_SIZE = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  AUDIO: 16 * 1024 * 1024, // 16MB
  VIDEO: 64 * 1024 * 1024 // 64MB
} as const;

// ===============================
// 🔧 CONFIGURACIÓN DE API
// ===============================
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  CHATBOTS: '/api/chatbots',
  WHATSAPP: '/api/whatsapp',
  CRM: '/api/crm',
  ANALYTICS: '/api/analytics',
  PAYMENTS: '/api/payments',
  NOTIFICATIONS: '/api/notifications'
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

// ===============================
// ⚡ LÍMITES Y CONFIGURACIÓN
// ===============================
export const RATE_LIMITS = {
  API_REQUESTS_PER_MINUTE: 60,
  WHATSAPP_MESSAGES_PER_MINUTE: 30,
  LOGIN_ATTEMPTS: 5,
  PASSWORD_RESET_ATTEMPTS: 3
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100
} as const;

export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400 // 24 hours
} as const;

// ===============================
// 🎨 TEMA Y UI
// ===============================
export const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const;

export const COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#6366F1'
} as const;

// ===============================
// 🔍 FILTROS Y BÚSQUEDAS
// ===============================
export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc'
} as const;

export const SEARCH_FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  RECENT: 'recent'
} as const;