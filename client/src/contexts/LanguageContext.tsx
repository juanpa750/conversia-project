import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'es' | 'en' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  es: {
    // Login
    'login.title': 'BotMaster',
    'login.subtitle': 'Inicia sesión para gestionar tus chatbots',
    'login.email': 'Correo electrónico',
    'login.password': 'Contraseña',
    'login.submit': 'Iniciar Sesión',
    'login.noAccount': '¿No tienes cuenta?',
    'login.register': 'Regístrate aquí',
    'login.emailPlaceholder': 'tu@email.com',
    'login.passwordPlaceholder': 'Tu contraseña',
    
    // Dashboard
    'dashboard.title': 'Panel de Control',
    'dashboard.subtitle': 'Gestiona tus chatbots y supervisa el rendimiento',
    'dashboard.quickActions': 'Acciones Rápidas',
    'dashboard.createBot': 'Crear Chatbot',
    'dashboard.viewAnalytics': 'Ver Analíticas',
    'dashboard.manageCRM': 'Gestionar CRM',
    'dashboard.whatsappConnect': 'Conectar WhatsApp',
    
    // Navigation
    'nav.dashboard': 'Inicio',
    'nav.chatbots': 'Chatbots',
    'nav.clients': 'Clientes',
    'nav.analytics': 'Analíticas',
    'nav.crm': 'CRM',
    'nav.templates': 'Templates',
    'nav.multimedia': 'Multimedia',
    'nav.settings': 'Configuración',
    'nav.support': 'Soporte',
    'nav.subscription': 'Suscripción',
    'nav.store': 'Tienda',
    'nav.campaigns': 'Campañas',
    'nav.reports': 'Reportes',
    'nav.integrations': 'Integraciones',
    'nav.aiAdvanced': 'IA Avanzada',
    'nav.crmAdvanced': 'CRM Avanzado',
    
    // Common
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.create': 'Crear',
    'common.back': 'Volver',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.loading': 'Cargando...',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.actions': 'Acciones',
    'common.status': 'Estado',
    'common.name': 'Nombre',
    'common.email': 'Email',
    'common.phone': 'Teléfono',
    'common.date': 'Fecha',
    'common.yes': 'Sí',
    'common.no': 'No',
    'common.confirm': 'Confirmar',
    'common.close': 'Cerrar',
    
    // Settings
    'settings.profile': 'Perfil',
    'settings.password': 'Contraseña',
    'settings.subscription': 'Suscripción',
    'settings.preferences': 'Preferencias',
    'settings.notifications': 'Notificaciones',
    'settings.language': 'Idioma',
    'settings.timezone': 'Zona Horaria',
    'settings.theme': 'Tema',
    
    // Profile
    'profile.firstName': 'Nombre',
    'profile.lastName': 'Apellido',
    'profile.company': 'Empresa',
    'profile.bio': 'Biografía',
    'profile.avatar': 'Avatar',
    'profile.save': 'Guardar Perfil',
    'profile.saving': 'Guardando...',
    
    // Password
    'password.current': 'Contraseña Actual',
    'password.new': 'Nueva Contraseña',
    'password.confirm': 'Confirmar Contraseña',
    'password.change': 'Cambiar Contraseña',
    'password.changing': 'Cambiando...',
    
    // Subscription
    'subscription.current': 'Plan Actual',
    'subscription.upgrade': 'Mejorar Plan',
    'subscription.billing': 'Facturación',
    'subscription.usage': 'Uso',
    
    // Preferences
    'preferences.notifications': 'Recibir notificaciones por email',
    'preferences.marketing': 'Recibir emails de marketing',
    'preferences.language': 'Idioma de la interfaz',
    'preferences.timezone': 'Zona horaria',
    'preferences.save': 'Guardar Preferencias',
    'preferences.saving': 'Guardando...',
    
    // Multimedia
    'multimedia.title': 'Gestión de Archivos Multimedia',
    'multimedia.subtitle': 'Administra imágenes, videos y audios para tus chatbots',
    'multimedia.uploadArea': 'Arrastra archivos aquí o haz clic para seleccionar',
    'multimedia.supportedFormats': 'Soporta imágenes (JPG, PNG), videos (MP4, MOV) y audios (MP3, M4A)',
    'multimedia.selectFiles': 'Seleccionar Archivos',
    'multimedia.uploadSuccess': 'Archivo subido exitosamente',
    'multimedia.fileUploadedSuccessfully': 'El archivo se ha subido correctamente',
    'multimedia.uploadError': 'Error al subir archivo',
    'multimedia.deleteSuccess': 'Archivo eliminado',
    'multimedia.fileDeletedSuccessfully': 'El archivo se ha eliminado correctamente',
    'multimedia.noFiles': 'No hay archivos multimedia',
    'multimedia.noFilesDescription': 'Sube tus primeros archivos para comenzar',
    
    // Templates
    'templates.title': 'Templates de Chatbots',
    'templates.subtitle': 'Flujos prediseñados para diferentes industrias',
    'templates.useTemplate': 'Usar Template',
    'templates.preview': 'Vista Previa',
    'templates.configure': 'Configurar',
    
    // CRM Advanced
    'crmAdvanced.title': 'CRM Avanzado',
    'crmAdvanced.subtitle': 'Herramientas profesionales para gestión de clientes',
    'crmAdvanced.leadScoring': 'Puntuación de Leads',
    'crmAdvanced.salesPipeline': 'Pipeline de Ventas',
    'crmAdvanced.customerSegmentation': 'Segmentación de Clientes',
    'crmAdvanced.automationWorkflows': 'Flujos de Automatización',
    'crmAdvanced.advancedReports': 'Reportes Avanzados',
    'crmAdvanced.apiIntegrations': 'Integraciones API',
    'crmAdvanced.configure': 'Configurar',
    'crmAdvanced.explore': 'Explorar',
    
    // Login page
    'loginPage.welcome': 'Bienvenido a BotMaster',
    'loginPage.description': 'La plataforma líder para gestión de chatbots de WhatsApp'
  },
  en: {
    // Login
    'login.title': 'BotMaster',
    'login.subtitle': 'Sign in to manage your chatbots',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.submit': 'Sign In',
    'login.noAccount': "Don't have an account?",
    'login.register': 'Register here',
    'login.emailPlaceholder': 'your@email.com',
    'login.passwordPlaceholder': 'Your password',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Manage your chatbots and monitor performance',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.createBot': 'Create Chatbot',
    'dashboard.viewAnalytics': 'View Analytics',
    'dashboard.manageCRM': 'Manage CRM',
    'dashboard.whatsappConnect': 'Connect WhatsApp',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.chatbots': 'Chatbots',
    'nav.clients': 'Clients',
    'nav.analytics': 'Analytics',
    'nav.crm': 'CRM',
    'nav.templates': 'Templates',
    'nav.multimedia': 'Multimedia',
    'nav.settings': 'Settings',
    'nav.support': 'Support',
    'nav.subscription': 'Subscription',
    'nav.store': 'Store',
    'nav.campaigns': 'Campaigns',
    'nav.reports': 'Reports',
    'nav.integrations': 'Integrations',
    'nav.aiAdvanced': 'Advanced AI',
    'nav.crmAdvanced': 'Advanced CRM',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.loading': 'Loading...',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.actions': 'Actions',
    'common.status': 'Status',
    'common.name': 'Name',
    'common.email': 'Email',
    'common.phone': 'Phone',
    'common.date': 'Date',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    
    // Settings
    'settings.profile': 'Profile',
    'settings.password': 'Password',
    'settings.subscription': 'Subscription',
    'settings.preferences': 'Preferences',
    'settings.notifications': 'Notifications',
    'settings.language': 'Language',
    'settings.timezone': 'Timezone',
    'settings.theme': 'Theme',
    
    // Profile
    'profile.firstName': 'First Name',
    'profile.lastName': 'Last Name',
    'profile.company': 'Company',
    'profile.bio': 'Bio',
    'profile.avatar': 'Avatar',
    'profile.save': 'Save Profile',
    'profile.saving': 'Saving...',
    
    // Password
    'password.current': 'Current Password',
    'password.new': 'New Password',
    'password.confirm': 'Confirm Password',
    'password.change': 'Change Password',
    'password.changing': 'Changing...',
    
    // Subscription
    'subscription.current': 'Current Plan',
    'subscription.upgrade': 'Upgrade Plan',
    'subscription.billing': 'Billing',
    'subscription.usage': 'Usage',
    
    // Preferences
    'preferences.notifications': 'Receive email notifications',
    'preferences.marketing': 'Receive marketing emails',
    'preferences.language': 'Interface language',
    'preferences.timezone': 'Timezone',
    'preferences.save': 'Save Preferences',
    'preferences.saving': 'Saving...',
    
    // Multimedia
    'multimedia.title': 'Multimedia File Management',
    'multimedia.subtitle': 'Manage images, videos and audio for your chatbots',
    'multimedia.uploadArea': 'Drag files here or click to select',
    'multimedia.supportedFormats': 'Supports images (JPG, PNG), videos (MP4, MOV) and audio (MP3, M4A)',
    'multimedia.selectFiles': 'Select Files',
    'multimedia.uploadSuccess': 'File uploaded successfully',
    'multimedia.fileUploadedSuccessfully': 'The file has been uploaded successfully',
    'multimedia.uploadError': 'Error uploading file',
    'multimedia.deleteSuccess': 'File deleted',
    'multimedia.fileDeletedSuccessfully': 'The file has been deleted successfully',
    'multimedia.noFiles': 'No multimedia files',
    'multimedia.noFilesDescription': 'Upload your first files to get started',
    
    // Templates
    'templates.title': 'Chatbot Templates',
    'templates.subtitle': 'Pre-designed flows for different industries',
    'templates.useTemplate': 'Use Template',
    'templates.preview': 'Preview',
    'templates.configure': 'Configure',
    
    // CRM Advanced
    'crmAdvanced.title': 'Advanced CRM',
    'crmAdvanced.subtitle': 'Professional tools for customer management',
    'crmAdvanced.leadScoring': 'Lead Scoring',
    'crmAdvanced.salesPipeline': 'Sales Pipeline',
    'crmAdvanced.customerSegmentation': 'Customer Segmentation',
    'crmAdvanced.automationWorkflows': 'Automation Workflows',
    'crmAdvanced.advancedReports': 'Advanced Reports',
    'crmAdvanced.apiIntegrations': 'API Integrations',
    'crmAdvanced.configure': 'Configure',
    'crmAdvanced.explore': 'Explore',
    
    // Login page
    'loginPage.welcome': 'Welcome to BotMaster',
    'loginPage.description': 'The leading platform for WhatsApp chatbot management'
  },
  pt: {
    // Login
    'login.title': 'BotMaster',
    'login.subtitle': 'Entre para gerenciar seus chatbots',
    'login.email': 'Email',
    'login.password': 'Senha',
    'login.submit': 'Entrar',
    'login.noAccount': 'Não tem uma conta?',
    'login.register': 'Registre-se aqui',
    'login.emailPlaceholder': 'seu@email.com',
    'login.passwordPlaceholder': 'Sua senha',
    
    // Dashboard
    'dashboard.title': 'Painel de Controle',
    'dashboard.subtitle': 'Gerencie seus chatbots e monitore o desempenho',
    'dashboard.quickActions': 'Ações Rápidas',
    'dashboard.createBot': 'Criar Chatbot',
    'dashboard.viewAnalytics': 'Ver Analíticas',
    'dashboard.manageCRM': 'Gerenciar CRM',
    'dashboard.whatsappConnect': 'Conectar WhatsApp',
    
    // Navigation
    'nav.dashboard': 'Início',
    'nav.chatbots': 'Chatbots',
    'nav.clients': 'Clientes',
    'nav.analytics': 'Analíticas',
    'nav.crm': 'CRM',
    'nav.templates': 'Templates',
    'nav.multimedia': 'Multimídia',
    'nav.settings': 'Configurações',
    'nav.support': 'Suporte',
    'nav.subscription': 'Assinatura',
    'nav.store': 'Loja',
    'nav.campaigns': 'Campanhas',
    'nav.reports': 'Relatórios',
    'nav.integrations': 'Integrações',
    'nav.aiAdvanced': 'IA Avançada',
    'nav.crmAdvanced': 'CRM Avançado',
    
    // Common
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
    'common.create': 'Criar',
    'common.back': 'Voltar',
    'common.next': 'Próximo',
    'common.previous': 'Anterior',
    'common.loading': 'Carregando...',
    'common.search': 'Pesquisar',
    'common.filter': 'Filtrar',
    'common.actions': 'Ações',
    'common.status': 'Status',
    'common.name': 'Nome',
    'common.email': 'Email',
    'common.phone': 'Telefone',
    'common.date': 'Data',
    'common.yes': 'Sim',
    'common.no': 'Não',
    'common.confirm': 'Confirmar',
    'common.close': 'Fechar',
    
    // Settings
    'settings.profile': 'Perfil',
    'settings.password': 'Senha',
    'settings.subscription': 'Assinatura',
    'settings.preferences': 'Preferências',
    'settings.notifications': 'Notificações',
    'settings.language': 'Idioma',
    'settings.timezone': 'Fuso Horário',
    'settings.theme': 'Tema',
    
    // Profile
    'profile.firstName': 'Nome',
    'profile.lastName': 'Sobrenome',
    'profile.company': 'Empresa',
    'profile.bio': 'Biografia',
    'profile.avatar': 'Avatar',
    'profile.save': 'Salvar Perfil',
    'profile.saving': 'Salvando...',
    
    // Password
    'password.current': 'Senha Atual',
    'password.new': 'Nova Senha',
    'password.confirm': 'Confirmar Senha',
    'password.change': 'Alterar Senha',
    'password.changing': 'Alterando...',
    
    // Subscription
    'subscription.current': 'Plano Atual',
    'subscription.upgrade': 'Atualizar Plano',
    'subscription.billing': 'Faturamento',
    'subscription.usage': 'Uso',
    
    // Preferences
    'preferences.notifications': 'Receber notificações por email',
    'preferences.marketing': 'Receber emails de marketing',
    'preferences.language': 'Idioma da interface',
    'preferences.timezone': 'Fuso horário',
    'preferences.save': 'Salvar Preferências',
    'preferences.saving': 'Salvando...',
    
    // Multimedia
    'multimedia.title': 'Gestão de Arquivos Multimídia',
    'multimedia.subtitle': 'Gerencie imagens, vídeos e áudios para seus chatbots',
    'multimedia.uploadArea': 'Arraste arquivos aqui ou clique para selecionar',
    'multimedia.supportedFormats': 'Suporta imagens (JPG, PNG), vídeos (MP4, MOV) e áudios (MP3, M4A)',
    'multimedia.selectFiles': 'Selecionar Arquivos',
    'multimedia.uploadSuccess': 'Arquivo enviado com sucesso',
    'multimedia.fileUploadedSuccessfully': 'O arquivo foi enviado com sucesso',
    'multimedia.uploadError': 'Erro ao enviar arquivo',
    'multimedia.deleteSuccess': 'Arquivo excluído',
    'multimedia.fileDeletedSuccessfully': 'O arquivo foi excluído com sucesso',
    'multimedia.noFiles': 'Nenhum arquivo multimídia',
    'multimedia.noFilesDescription': 'Envie seus primeiros arquivos para começar',
    
    // Templates
    'templates.title': 'Templates de Chatbots',
    'templates.subtitle': 'Fluxos pré-desenhados para diferentes indústrias',
    'templates.useTemplate': 'Usar Template',
    'templates.preview': 'Visualizar',
    'templates.configure': 'Configurar',
    
    // CRM Advanced
    'crmAdvanced.title': 'CRM Avançado',
    'crmAdvanced.subtitle': 'Ferramentas profissionais para gestão de clientes',
    'crmAdvanced.leadScoring': 'Pontuação de Leads',
    'crmAdvanced.salesPipeline': 'Pipeline de Vendas',
    'crmAdvanced.customerSegmentation': 'Segmentação de Clientes',
    'crmAdvanced.automationWorkflows': 'Fluxos de Automação',
    'crmAdvanced.advancedReports': 'Relatórios Avançados',
    'crmAdvanced.apiIntegrations': 'Integrações API',
    'crmAdvanced.configure': 'Configurar',
    'crmAdvanced.explore': 'Explorar',
    
    // Login page
    'loginPage.welcome': 'Bem-vindo ao BotMaster',
    'loginPage.description': 'A plataforma líder para gestão de chatbots do WhatsApp'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'es';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}