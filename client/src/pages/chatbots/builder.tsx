import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChatbotBuilder } from "@/components/chatbot/builder";

export function ChatbotBuilderPage({ id }: { id?: string }) {
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

  return <ChatbotBuilder />;
}

export default ChatbotBuilderPage;
