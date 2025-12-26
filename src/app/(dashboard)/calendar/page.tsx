'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { CalendarContainer } from '@/components/calendar';
import { CalendarDays } from 'lucide-react';

export default function CalendarPage() {
  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <PageHeader
        title="Calendar"
        description="View and manage all events, deadlines, and milestones"
        icon={CalendarDays}
      />

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

