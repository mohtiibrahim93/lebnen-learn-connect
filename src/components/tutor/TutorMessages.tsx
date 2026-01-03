import { MessagesPage } from "@/components/shared/MessagesPage";

interface TutorMessagesProps {
  tutorId: string;
}

export function TutorMessages({ tutorId }: TutorMessagesProps) {
  return <MessagesPage userId={tutorId} />;
}
