'use client';

import { CalendarContainer } from '@/components/calendar';

export default function CalendarPage() {
  return (
    <div className="h-full flex flex-col">
      {/* Calendar */}
      <div className="flex-1 min-h-0 p-6">
        <CalendarContainer
          scope="all"
          showHeader={true}
          showFilters={true}
          className="h-full"
        />
      </div>
    </div>
  );
}
