import { Conversation } from "@/hooks/useMessages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
  loading?: boolean;
}

export function ConversationList({ conversations, selectedId, onSelect, loading }: ConversationListProps) {
  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading conversations...
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No conversations yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
              selectedId === conversation.id
                ? "bg-accent"
                : "hover:bg-accent/50"
            )}
          >
            <Avatar>
              <AvatarImage src={conversation.other_user?.avatar_url || undefined} />
              <AvatarFallback>
                {conversation.other_user?.full_name?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">
                  {conversation.other_user?.full_name || "Unknown"}
                </span>
                {conversation.last_message && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.last_message?.content || "No messages yet"}
                </p>
                {(conversation.unread_count || 0) > 0 && (
                  <Badge variant="default" className="ml-2">
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
