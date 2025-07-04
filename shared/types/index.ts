// 🏗️ TIPOS COMPARTIDOS - CONVERSIA
// Tipos TypeScript compartidos entre frontend y backend

// ===============================
// 🔐 AUTENTICACIÓN
// ===============================
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'user' | 'viewer';
  subscriptionTier: 'free' | 'basic' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'unpaid';
  twoFactorEnabled: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName?: string;
}

// ===============================
// 🤖 CHATBOTS
// ===============================
export interface Chatbot {
  id: string;
  name: string;
  description: string;
  industry: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  aiPersonality: 'professional' | 'friendly' | 'casual' | 'enthusiastic';
  conversationObjective: 'sales' | 'support' | 'information' | 'appointment';
  triggerKeywords: string[];
  welcomeMessage: string;
  fallbackMessage: string;
  isActive: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatbotFlow {
  id: string;
  chatbotId: string;
  name: string;
  version: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  isActive: boolean;
  createdAt: Date;
}

export interface FlowNode {
  id: string;
  type: 'message' | 'question' | 'condition' | 'action' | 'ai_response';
  position: { x: number; y: number };
  data: {
    label: string;
    content: string;
    responses?: string[];
    conditions?: string[];
    actions?: string[];
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type: 'default' | 'conditional';
  label?: string;
}

// ===============================
// 📱 WHATSAPP
// ===============================
export interface WhatsAppIntegration {
  id: string;
  userId: string;
  chatbotId?: string;
  phoneNumber: string;
  sessionId: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  qrCode?: string;
  lastConnectionAt?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface WhatsAppMessage {
  id: string;
  integrationId: string;
  contactId: string;
  direction: 'inbound' | 'outbound';
  content: string;
  messageType: 'text' | 'image' | 'document' | 'voice' | 'video';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  isFromBot: boolean;
  metadata?: Record<string, any>;
}

export interface WhatsAppContact {
  id: string;
  phone: string;
  name?: string;
  profilePicture?: string;
  lastSeen?: Date;
  isBlocked: boolean;
  labels: string[];
  customFields: Record<string, any>;
  createdAt: Date;
}

// ===============================
// 👥 CRM
// ===============================
export interface Contact {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone: string;
  company?: string;
  position?: string;
  source: 'whatsapp' | 'manual' | 'import' | 'api';
  leadScore: number;
  leadStage: 'cold' | 'warm' | 'hot' | 'qualified' | 'customer' | 'lost';
  priority: 'low' | 'medium' | 'high';
  estimatedValue: number;
  tags: string[];
  customFields: Record<string, any>;
  lastContactAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  contactId: string;
  userId: string;
  chatbotId?: string;
  status: 'active' | 'resolved' | 'archived';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  summary?: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  messageCount: number;
  lastMessageAt: Date;
  createdAt: Date;
}

// ===============================
// 🔧 API RESPONSES
// ===============================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginatedResponse<T = any> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===============================
// 🎨 UI STATES
// ===============================
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated?: Date;
}