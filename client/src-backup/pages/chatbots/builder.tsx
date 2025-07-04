import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChatbotBuilder } from "@/components/chatbot/builder";

export function ChatbotBuilderPage({ id }: { id?: string }) {
  console.log('🎯 ChatbotBuilderPage received ID:', id);
  console.log('🎯 ID type:', typeof id);
  
  return <ChatbotBuilder chatbotId={id} />;
}

export default ChatbotBuilderPage;
