import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  student_id: string;
  tutor_id: string;
  created_at: string;
  updated_at: string;
  other_user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  last_message?: Message;
  unread_count?: number;
}

export function useMessages(userId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`student_id.eq.${userId},tutor_id.eq.${userId}`)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      return;
    }

    // Fetch other user details and last message for each conversation
    const enrichedConversations = await Promise.all(
      (data || []).map(async (conv) => {
        const otherUserId = conv.student_id === userId ? conv.tutor_id : conv.student_id;
        
        const [profileRes, messagesRes, unreadRes] = await Promise.all([
          supabase.from("profiles").select("id, full_name, avatar_url").eq("id", otherUserId).single(),
          supabase.from("messages").select("*").eq("conversation_id", conv.id).order("created_at", { ascending: false }).limit(1),
          supabase.from("messages").select("id", { count: "exact" }).eq("conversation_id", conv.id).eq("read", false).neq("sender_id", userId)
        ]);

        return {
          ...conv,
          other_user: profileRes.data || undefined,
          last_message: messagesRes.data?.[0] || undefined,
          unread_count: unreadRes.count || 0
        };
      })
    );

    setConversations(enrichedConversations);
    setLoading(false);
  };

  const getOrCreateConversation = async (otherUserId: string, isCurrentUserStudent: boolean) => {
    if (!userId) return null;

    const studentId = isCurrentUserStudent ? userId : otherUserId;
    const tutorId = isCurrentUserStudent ? otherUserId : userId;

    // Check if conversation exists
    const { data: existing } = await supabase
      .from("conversations")
      .select("*")
      .eq("student_id", studentId)
      .eq("tutor_id", tutorId)
      .single();

    if (existing) return existing;

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from("conversations")
      .insert({ student_id: studentId, tutor_id: tutorId })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return null;
    }

    return newConv;
  };

  useEffect(() => {
    fetchConversations();
  }, [userId]);

  return {
    conversations,
    loading,
    refetch: fetchConversations,
    getOrCreateConversation
  };
}

export function useConversationMessages(conversationId: string | null, userId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    if (!conversationId) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    setMessages(data || []);
    setLoading(false);

    // Mark messages as read
    if (userId) {
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId)
        .eq("read", false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!conversationId || !userId || !content.trim()) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: content.trim()
    });

    if (error) {
      console.error("Error sending message:", error);
      return false;
    }

    // Update conversation timestamp
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return true;
  };

  useEffect(() => {
    fetchMessages();

    if (!conversationId) return;

    // Subscribe to realtime messages
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          // Mark as read if not sender
          if (userId && payload.new.sender_id !== userId) {
            supabase
              .from("messages")
              .update({ read: true })
              .eq("id", payload.new.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId]);

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages
  };
}
