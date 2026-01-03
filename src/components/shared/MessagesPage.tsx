import { useState, useEffect } from "react";
import { useMessages, Conversation } from "@/hooks/useMessages";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MessagesPageProps {
  userId: string;
}

export function MessagesPage({ userId }: MessagesPageProps) {
  const { conversations, loading, refetch } = useMessages(userId);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const isMobile = useIsMobile();

  // On mobile, show either list or chat
  const showList = !isMobile || !selectedConversation;
  const showChat = !isMobile || selectedConversation;

  useEffect(() => {
    // Refetch conversations periodically to update last message and unread count
    const interval = setInterval(refetch, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <div className="h-[calc(100vh-8rem)]">
      <Card className="h-full flex overflow-hidden">
        {/* Conversation List */}
        {showList && (
          <div className={`${isMobile ? "w-full" : "w-80"} border-r flex flex-col`}>
            <div className="p-4 border-b">
              <h2 className="font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages
              </h2>
            </div>
            <div className="flex-1">
              <ConversationList
                conversations={conversations}
                selectedId={selectedConversation?.id}
                onSelect={setSelectedConversation}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* Chat Window */}
        {showChat && (
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <ChatWindow
                conversationId={selectedConversation.id}
                userId={userId}
                otherUser={selectedConversation.other_user || { id: "", full_name: "Unknown", avatar_url: null }}
                onBack={isMobile ? () => setSelectedConversation(null) : undefined}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
