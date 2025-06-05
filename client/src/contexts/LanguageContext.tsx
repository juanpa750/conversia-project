import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'es' | 'en' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traducciones
const translations = {
  es: {
    // Login
    'login.title': 'BotMaster',
    'login.subtitle': 'Inicia sesión para gestionar tus chatbots',
    'login.email': 'Email',
    'login.password': 'Contraseña',
    'login.submit': 'Iniciar Sesión',
    'login.noAccount': '¿No tienes cuenta?',
    'login.register': 'Regístrate aquí',
    'login.emailPlaceholder': 'tu@email.com',
    'login.passwordPlaceholder': 'Tu contraseña',
    
    // Navigation
    'nav.dashboard': 'Panel de Control',
    'nav.chatbots': 'Chatbots',
    'nav.analytics': 'Analíticas',
    'nav.clients': 'Clientes',
    'nav.settings': 'Configuración',
    'nav.support': 'Soporte',
    'nav.integrations': 'Integraciones',
    'nav.marketing': 'Marketing',
    'nav.crm': 'CRM',
    'nav.reports': 'Reportes',
    'nav.subscription': 'Suscripción',
    'nav.store': 'Tienda',
    
    // Settings
    'settings.title': 'Configuración',
    'settings.profile': 'Perfil',
    'settings.password': 'Contraseña',
    'settings.subscription': 'Suscripción',
    'settings.preferences': 'Preferencias',
    
    // Profile
    'profile.title': 'Información del Perfil',
    'profile.subtitle': 'Actualiza tu información personal y de contacto',
    
    // Common
    'common.success': 'Éxito',
    'common.error': 'Error',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.add': 'Agregar',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.loading': 'Cargando...',
    'profile.firstName': 'Nombre',
    'profile.lastName': 'Apellido',
    'profile.email': 'Email',
    'profile.company': 'Empresa',
    'profile.phone': 'Teléfono',
    'profile.bio': 'Biografía',
    'profile.save': 'Guardar Cambios',
    'profile.saving': 'Guardando...',
    
    // Password
    'password.title': 'Cambiar Contraseña',
    'password.subtitle': 'Actualiza tu contraseña para mantener tu cuenta segura',
    'password.current': 'Contraseña Actual',
    'password.new': 'Nueva Contraseña',
    'password.confirm': 'Confirmar Nueva Contraseña',
    'password.save': 'Actualizar Contraseña',
    'password.saving': 'Actualizando...',
    
    // Subscription
    'subscription.title': 'Plan de Suscripción',
    'subscription.subtitle': 'Gestiona tu plan y facturación',
    'subscription.current': 'Plan Actual',
    'subscription.status': 'Estado',
    'subscription.active': 'Activo',
    'subscription.daysLeft': 'días restantes',
    'subscription.renewal': 'Próxima renovación',
    'subscription.upgrade': 'Mejorar Plan',
    'subscription.cancel': 'Cancelar Suscripción',
    
    // Preferences
    'preferences.title': 'Preferencias Generales',
    'preferences.subtitle': 'Personaliza tu experiencia en la plataforma',
    'preferences.language': 'Idioma',
    'preferences.timezone': 'Zona Horaria',
    'preferences.notifications': 'Notificaciones',
    'preferences.dateFormat': 'Formato de fecha',
    'preferences.timeFormat': 'Formato de hora',
    'preferences.save': 'Guardar Preferencias',
    'preferences.saving': 'Guardando...',
    
    // Multimedia
    'multimedia.title': 'Multimedia',
    'multimedia.subtitle': 'Gestiona tus imágenes y videos para los chatbots',
    'multimedia.uploadFiles': 'Subir Archivos Multimedia',
    'multimedia.uploadFilesDesc': 'Sube imágenes y videos para usar en tus chatbots',
    'multimedia.dragDrop': 'Arrastra archivos aquí o haz clic para seleccionar',
    'multimedia.dragDropDesc': 'Soporta imágenes (JPG, PNG, GIF) y videos (MP4, MOV)',
    'multimedia.selectedFiles': 'Archivos Seleccionados',
    'multimedia.uploadNow': 'Subir Archivos',
    'multimedia.uploading': 'Subiendo...',
    'multimedia.mediaLibrary': 'Biblioteca de Medios',
    'multimedia.mediaLibraryDesc': 'Administra todos tus archivos multimedia',
    'multimedia.noFilesMessage': 'No hay archivos multimedia',
    'multimedia.image': 'Imagen',
    'multimedia.video': 'Video',
    'multimedia.uploadSuccess': 'Archivos subidos',
    'multimedia.uploadSuccessDesc': 'Los archivos se subieron correctamente',
    'multimedia.uploadError': 'Error al subir',
    'multimedia.deleteSuccess': 'Archivo eliminado',
    'multimedia.deleteSuccessDesc': 'El archivo se eliminó correctamente',
    'multimedia.deleteError': 'Error al eliminar',
    'multimedia.files': 'archivos',
    'multimedia.supportedFormats': 'Formatos soportados: JPG, PNG, MP4, MOV (máx. 10MB)',
    'multimedia.selectFiles': 'Seleccionar Archivos',
    'multimedia.searchFiles': 'Buscar archivos...',
    'multimedia.allFiles': 'Todos los archivos',
    'multimedia.images': 'Imágenes',
    'multimedia.videos': 'Videos',
    'multimedia.noFilesFound': 'No se encontraron archivos',
    'multimedia.noFilesYet': 'Aún no tienes archivos',
    'multimedia.tryDifferentSearch': 'Intenta con una búsqueda diferente',
    'multimedia.uploadFirstFile': 'Sube tu primer archivo para comenzar',
    'multimedia.fileUploadedSuccessfully': 'El archivo se subió correctamente',
    'multimedia.fileDeletedSuccessfully': 'El archivo se eliminó correctamente',
    'multimedia.invalidFileType': 'Tipo de archivo inválido',
    'multimedia.onlyImagesAndVideos': 'Solo se permiten imágenes y videos',
    'multimedia.fileTooLarge': 'Archivo muy grande',
    'multimedia.maxFileSize': 'El tamaño máximo del archivo es 10MB',
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
    'dashboard.welcome': 'Bienvenido de nuevo, aquí tienes un resumen de tu actividad',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.chatbots': 'Chatbots',
    'nav.analytics': 'Analytics',
    'nav.clients': 'Clients',
    'nav.settings': 'Settings',
    'nav.support': 'Support',
    'nav.integrations': 'Integrations',
    'nav.marketing': 'Marketing',
    'nav.crm': 'CRM',
    'nav.reports': 'Reports',
    'nav.subscription': 'Subscription',
    'nav.store': 'Store',
    
    // Settings
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.password': 'Password',
    'settings.subscription': 'Subscription',
    'settings.preferences': 'Preferences',
    
    // Profile
    'profile.title': 'Profile Information',
    'profile.subtitle': 'Update your personal and contact information',
    'profile.firstName': 'First Name',
    'profile.lastName': 'Last Name',
    'profile.email': 'Email',
    'profile.company': 'Company',
    'profile.phone': 'Phone',
    'profile.bio': 'Bio',
    'profile.save': 'Save Changes',
    'profile.saving': 'Saving...',
    
    // Password
    'password.title': 'Change Password',
    'password.subtitle': 'Update your password to keep your account secure',
    'password.current': 'Current Password',
    'password.new': 'New Password',
    'password.confirm': 'Confirm New Password',
    'password.save': 'Update Password',
    'password.saving': 'Updating...',
    
    // Subscription
    'subscription.title': 'Subscription Plan',
    'subscription.subtitle': 'Manage your plan and billing',
    'subscription.current': 'Current Plan',
    'subscription.status': 'Status',
    'subscription.active': 'Active',
    'subscription.daysLeft': 'days remaining',
    'subscription.renewal': 'Next renewal',
    'subscription.upgrade': 'Upgrade Plan',
    'subscription.cancel': 'Cancel Subscription',
    
    // Preferences
    'preferences.title': 'General Preferences',
    'preferences.subtitle': 'Customize your platform experience',
    'preferences.language': 'Language',
    'preferences.timezone': 'Timezone',
    'preferences.notifications': 'Notifications',
    'preferences.dateFormat': 'Date format',
    'preferences.timeFormat': 'Time format',
    'preferences.save': 'Save Preferences',
    'preferences.saving': 'Saving...',
    
    // Multimedia
    'multimedia.title': 'Multimedia',
    'multimedia.subtitle': 'Manage your images and videos for chatbots',
    'multimedia.upload': 'Upload Files',
    'multimedia.library': 'Library',
    'multimedia.uploadFiles': 'Upload Multimedia Files',
    'multimedia.uploadFilesDesc': 'Upload images and videos to use in your chatbots',
    'multimedia.dragDrop': 'Drag files here or click to select',
    'multimedia.dragDropDesc': 'Supports images (JPG, PNG, GIF) and videos (MP4, MOV)',
    'multimedia.selectedFiles': 'Selected Files',
    'multimedia.uploadNow': 'Upload Files',
    'multimedia.uploading': 'Uploading...',
    'multimedia.cancel': 'Cancel',
    'multimedia.mediaLibrary': 'Media Library',
    'multimedia.mediaLibraryDesc': 'Manage all your multimedia files',
    'multimedia.noFiles': 'No multimedia files',
    'multimedia.image': 'Image',
    'multimedia.video': 'Video',
    'multimedia.uploadSuccess': 'Files uploaded',
    'multimedia.uploadSuccessDesc': 'Files uploaded successfully',
    'multimedia.uploadError': 'Upload error',
    'multimedia.deleteSuccess': 'File deleted',
    'multimedia.deleteSuccessDesc': 'File deleted successfully',
    'multimedia.deleteError': 'Delete error',
    'multimedia.description': 'Manage your image and video files',
    'multimedia.files': 'files',
    'multimedia.dragDropOrClick': 'Drag and drop files here or click to select',
    'multimedia.supportedFormats': 'Supported formats: JPG, PNG, MP4, MOV (max 10MB)',
    'multimedia.selectFiles': 'Select Files',
    'multimedia.searchFiles': 'Search files...',
    'multimedia.allFiles': 'All files',
    'multimedia.images': 'Images',
    'multimedia.videos': 'Videos',
    'multimedia.noFilesFound': 'No files found',
    'multimedia.noFilesYet': 'You have no files yet',
    'multimedia.tryDifferentSearch': 'Try a different search',
    'multimedia.uploadFirstFile': 'Upload your first file to get started',
    'multimedia.fileUploadedSuccessfully': 'File uploaded successfully',
    'multimedia.fileDeletedSuccessfully': 'File deleted successfully',
    'multimedia.invalidFileType': 'Invalid file type',
    'multimedia.onlyImagesAndVideos': 'Only images and videos are allowed',
    'multimedia.fileTooLarge': 'File too large',
    'multimedia.maxFileSize': 'Maximum file size is 10MB',
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
    
    // Navigation
    'nav.dashboard': 'Painel',
    'nav.chatbots': 'Chatbots',
    'nav.analytics': 'Análises',
    'nav.clients': 'Clientes',
    'nav.settings': 'Configurações',
    'nav.support': 'Suporte',
    'nav.integrations': 'Integrações',
    'nav.marketing': 'Marketing',
    'nav.crm': 'CRM',
    'nav.reports': 'Relatórios',
    'nav.subscription': 'Assinatura',
    'nav.store': 'Loja',
    
    // Settings
    'settings.title': 'Configurações',
    'settings.profile': 'Perfil',
    'settings.password': 'Senha',
    'settings.subscription': 'Assinatura',
    'settings.preferences': 'Preferências',
    
    // Profile
    'profile.title': 'Informações do Perfil',
    'profile.subtitle': 'Atualize suas informações pessoais e de contato',
    'profile.firstName': 'Nome',
    'profile.lastName': 'Sobrenome',
    'profile.email': 'Email',
    'profile.company': 'Empresa',
    'profile.phone': 'Telefone',
    'profile.bio': 'Bio',
    'profile.save': 'Salvar Alterações',
    'profile.saving': 'Salvando...',
    
    // Password
    'password.title': 'Alterar Senha',
    'password.subtitle': 'Atualize sua senha para manter sua conta segura',
    'password.current': 'Senha Atual',
    'password.new': 'Nova Senha',
    'password.confirm': 'Confirmar Nova Senha',
    'password.save': 'Atualizar Senha',
    'password.saving': 'Atualizando...',
    
    // Subscription
    'subscription.title': 'Plano de Assinatura',
    'subscription.subtitle': 'Gerencie seu plano e faturamento',
    'subscription.current': 'Plano Atual',
    'subscription.status': 'Status',
    'subscription.active': 'Ativo',
    'subscription.daysLeft': 'dias restantes',
    'subscription.renewal': 'Próxima renovação',
    'subscription.upgrade': 'Melhorar Plano',
    'subscription.cancel': 'Cancelar Assinatura',
    
    // Preferences
    'preferences.title': 'Preferências Gerais',
    'preferences.subtitle': 'Personalize sua experiência na plataforma',
    'preferences.language': 'Idioma',
    'preferences.timezone': 'Fuso Horário',
    'preferences.notifications': 'Notificações',
    'preferences.dateFormat': 'Formato de data',
    'preferences.timeFormat': 'Formato de hora',
    'preferences.save': 'Salvar Preferências',
    'preferences.saving': 'Salvando...',
    
    // Multimedia
    'multimedia.title': 'Multimídia',
    'multimedia.subtitle': 'Gerencie suas imagens e vídeos para chatbots',
    'multimedia.upload': 'Enviar Arquivos',
    'multimedia.library': 'Biblioteca',
    'multimedia.uploadFiles': 'Enviar Arquivos Multimídia',
    'multimedia.uploadFilesDesc': 'Envie imagens e vídeos para usar em seus chatbots',
    'multimedia.dragDrop': 'Arraste arquivos aqui ou clique para selecionar',
    'multimedia.dragDropDesc': 'Suporta imagens (JPG, PNG, GIF) e vídeos (MP4, MOV)',
    'multimedia.selectedFiles': 'Arquivos Selecionados',
    'multimedia.uploadNow': 'Enviar Arquivos',
    'multimedia.uploading': 'Enviando...',
    'multimedia.cancel': 'Cancelar',
    'multimedia.mediaLibrary': 'Biblioteca de Mídia',
    'multimedia.mediaLibraryDesc': 'Gerencie todos os seus arquivos multimídia',
    'multimedia.noFiles': 'Nenhum arquivo multimídia',
    'multimedia.image': 'Imagem',
    'multimedia.video': 'Vídeo',
    'multimedia.uploadSuccess': 'Arquivos enviados',
    'multimedia.uploadSuccessDesc': 'Arquivos enviados com sucesso',
    'multimedia.uploadError': 'Erro no envio',
    'multimedia.deleteSuccess': 'Arquivo excluído',
    'multimedia.deleteSuccessDesc': 'Arquivo excluído com sucesso',
    'multimedia.deleteError': 'Erro ao excluir',
    'multimedia.description': 'Gerencie seus arquivos de imagem e vídeo',
    'multimedia.files': 'arquivos',
    'multimedia.dragDropOrClick': 'Arraste e solte arquivos aqui ou clique para selecionar',
    'multimedia.supportedFormats': 'Formatos suportados: JPG, PNG, MP4, MOV (máx. 10MB)',
    'multimedia.selectFiles': 'Selecionar Arquivos',
    'multimedia.searchFiles': 'Buscar arquivos...',
    'multimedia.allFiles': 'Todos os arquivos',
    'multimedia.images': 'Imagens',
    'multimedia.videos': 'Vídeos',
    'multimedia.noFilesFound': 'Nenhum arquivo encontrado',
    'multimedia.noFilesYet': 'Você ainda não tem arquivos',
    'multimedia.tryDifferentSearch': 'Tente uma busca diferente',
    'multimedia.uploadFirstFile': 'Envie seu primeiro arquivo para começar',
    'multimedia.fileUploadedSuccessfully': 'Arquivo enviado com sucesso',
    'multimedia.fileDeletedSuccessfully': 'Arquivo excluído com sucesso',
    'multimedia.invalidFileType': 'Tipo de arquivo inválido',
    'multimedia.onlyImagesAndVideos': 'Apenas imagens e vídeos são permitidos',
    'multimedia.fileTooLarge': 'Arquivo muito grande',
    'multimedia.maxFileSize': 'Tamanho máximo do arquivo é 10MB',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('botmaster-language');
    return (saved as Language) || 'es';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('botmaster-language', lang);
  };

  const t = (key: string): string => {
    return (translations[language] as any)[key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return default values instead of throwing error to prevent crashes
    return {
      language: 'es' as Language,
      setLanguage: () => {},
      t: (key: string) => key
    };
  }
  return context;
}