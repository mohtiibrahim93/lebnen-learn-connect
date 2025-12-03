import { BookingsCalendar } from "@/components/shared/BookingsCalendar";

interface TutorCalendarProps {
  tutorId: string;
}

export function TutorCalendar({ tutorId }: TutorCalendarProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Calendar</h2>
      <BookingsCalendar userId={tutorId} role="tutor" />
    </div>
  );
}
