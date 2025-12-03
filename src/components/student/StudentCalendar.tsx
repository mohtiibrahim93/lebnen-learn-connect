import { BookingsCalendar } from "@/components/shared/BookingsCalendar";

interface StudentCalendarProps {
  studentId: string;
}

export function StudentCalendar({ studentId }: StudentCalendarProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Calendar</h2>
      <BookingsCalendar userId={studentId} role="student" />
    </div>
  );
}
