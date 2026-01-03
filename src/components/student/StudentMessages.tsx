import { MessagesPage } from "@/components/shared/MessagesPage";

interface StudentMessagesProps {
  studentId: string;
}

export function StudentMessages({ studentId }: StudentMessagesProps) {
  return <MessagesPage userId={studentId} />;
}
