import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChatbotBuilder } from "@/components/chatbot/builder";

export function ChatbotBuilderPage({ id: propId }: { id?: string }) {
  const params = useParams();
  const id = propId || params.id;
  
  console.log('🎯 ChatbotBuilderPage params:', params);
  console.log('🎯 ChatbotBuilderPage prop ID:', propId);
  console.log('🎯 ChatbotBuilderPage final ID:', id);
  
  const { data: chatbot, isLoading } = useQuery({
    queryKey: ["/api/chatbots", id],
    // Only fetch if we have an ID
    enabled: !!id,
  });

  if (id && isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return <ChatbotBuilder chatbotId={id} />;
}

export default ChatbotBuilderPage;
