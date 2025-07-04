import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { WhatsAppIntegration, WhatsAppMessage } from '@shared/types';

interface WhatsAppStatus {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  qrCode?: string;
  sessionId?: string;
  phoneNumber?: string;
  isSimulated?: boolean;
}

export function useWhatsApp(chatbotId?: string) {
  const queryClient = useQueryClient();
  const [pollingEnabled, setPollingEnabled] = useState(false);

  // Get integrations list
  const { data: integrations = [], isLoading: integrationsLoading } = useQuery<WhatsAppIntegration[]>({
    queryKey: ['/api/whatsapp/integrations'],
    staleTime: 30 * 1000, // 30 seconds
  });

  // Get WhatsApp status for specific chatbot or general
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useQuery<WhatsAppStatus>({
    queryKey: chatbotId ? ['/api/whatsapp/status', chatbotId] : ['/api/whatsapp-web/status'],
    refetchInterval: pollingEnabled ? 3000 : false,
    retry: false,
  });

  // Initialize WhatsApp session
  const initSessionMutation = useMutation({
    mutationFn: async (data?: { chatbotId?: string }) => {
      const endpoint = data?.chatbotId 
        ? '/api/whatsapp/integrations/create-integration'
        : '/api/whatsapp-web/init-session';
      
      const payload = data?.chatbotId ? { chatbotId: parseInt(data.chatbotId) } : {};
      
      const response = await apiRequest('POST', endpoint, payload);
      return response.data;
    },
    onSuccess: () => {
      setPollingEnabled(true);
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/integrations'] });
      setTimeout(() => refetchStatus(), 1000);
    },
  });

  // Disconnect WhatsApp session
  const disconnectMutation = useMutation({
    mutationFn: async (integrationId?: string) => {
      const endpoint = integrationId 
        ? `/api/whatsapp/integrations/${integrationId}/disconnect`
        : '/api/whatsapp-web/disconnect';
      
      const response = await apiRequest('POST', endpoint, {});
      return response.data;
    },
    onSuccess: () => {
      setPollingEnabled(false);
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/integrations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp-web/status'] });
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { 
      integrationId: string; 
      contactPhone: string; 
      message: string; 
      messageType?: 'text' | 'image' | 'document';
    }) => {
      const response = await apiRequest('POST', '/api/whatsapp/send-message', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/messages'] });
    },
  });

  // Auto-stop polling when connected
  useEffect(() => {
    if (status?.status === 'connected') {
      setPollingEnabled(false);
    }
  }, [status?.status]);

  return {
    // Data
    integrations,
    status,
    
    // Loading states
    isLoading: integrationsLoading || statusLoading,
    isInitializing: initSessionMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    isSending: sendMessageMutation.isPending,
    
    // Actions
    initSession: (chatbotId?: string) => initSessionMutation.mutate({ chatbotId }),
    disconnect: (integrationId?: string) => disconnectMutation.mutate(integrationId),
    sendMessage: sendMessageMutation.mutate,
    
    // Utilities
    refetchStatus,
    isPolling: pollingEnabled,
    
    // Computed states
    isConnected: status?.status === 'connected',
    hasQR: status?.status === 'qr_ready' && !!status.qrCode,
    isConnecting: status?.status === 'connecting',
    hasError: status?.status === 'error',
  };
}

export function useWhatsAppMessages(integrationId?: string, contactId?: string) {
  const { data: messages = [], isLoading } = useQuery<WhatsAppMessage[]>({
    queryKey: ['/api/whatsapp/messages', integrationId, contactId].filter(Boolean),
    enabled: !!integrationId,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  return {
    messages,
    isLoading,
  };
}

export function useWhatsAppContacts(integrationId?: string) {
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['/api/whatsapp/contacts', integrationId],
    enabled: !!integrationId,
  });

  return {
    contacts,
    isLoading,
  };
}