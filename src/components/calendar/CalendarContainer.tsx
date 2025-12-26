'use client';

import { useCallback, useMemo } from 'react';
import { useCalendar, useGoogleCalendar } from '@/hooks/useCalendar';
import { useCalendarStore } from '@/stores/calendarStore';
import { CalendarHeader } from './CalendarHeader';
import { FilterPanel } from './FilterPanel';
import { EventModal } from './EventModal';
import { MonthView } from './views/MonthView';
import { WeekView } from './views/WeekView';
import { DayView } from './views/DayView';
import { AgendaView } from './views/AgendaView';
import { UnifiedCalendarItem, CreateEventSlot } from '@/types/calendar';
import { Loader2 } from 'lucide-react';

interface CalendarContainerProps {
  projectId?: string;
  clientId?: string;
  scope?: 'all' | 'tickets' | 'project';
  showHeader?: boolean;
  showFilters?: boolean;
  className?: string;
  teamMembers?: Array<{ _id: string; firstName: string; lastName: string; avatar?: string }>;
}

export function CalendarContainer({
  projectId,
  clientId,
  scope = 'all',
  showHeader = true,
  showFilters = true,
  className = '',
  teamMembers = [],
}: CalendarContainerProps) {
  const {
    viewType,
    filters,
    isFilterPanelOpen,
    openEventModal,
    setSelectedDate,
    isSyncingGoogle,
  } = useCalendarStore();

  const { items, isLoading, rescheduleEvent, refetch, forceSync } = useCalendar({
    projectId,
    clientId,
    scope,
    syncGoogleOnLoad: true,
    syncGoogleOnNavigate: true,
  });

  // Google Calendar connection status
  const { isConnected: isGoogleConnected } = useGoogleCalendar();

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return (
      filters.eventTypes.length +
      filters.projectIds.length +
      filters.clientIds.length +
      filters.assigneeIds.length +
      (filters.showCompleted ? 0 : 1) +
      (filters.showExternal ? 0 : 1)
    );
  }, [filters]);

  // Handle slot click (create new event)
  const handleSlotClick = useCallback(
    (slot: CreateEventSlot) => {
      openEventModal(undefined, slot);
    },
    [openEventModal]
  );

  // Handle event click (edit existing event)
  const handleEventClick = useCallback(
    (item: UnifiedCalendarItem) => {
      // Only open modal for actual events, not tickets/milestones
      if (item.type === 'event' && item.originalData) {
        openEventModal(item.originalData as any);
      }
    },
    [openEventModal]
  );

  // Handle date click (navigate to day)
  const handleDateClick = useCallback(
    (date: Date) => {
      setSelectedDate(date);
    },
    [setSelectedDate]
  );

  // Handle event drop (reschedule)
  const handleEventDrop = useCallback(
    async (item: UnifiedCalendarItem, newStart: Date, newEnd: Date) => {
      // Only allow rescheduling actual events
      if (item.type !== 'event') return;

      // Extract the event ID from the item
      const eventId = item.id;
      await rescheduleEvent(eventId, newStart, newEnd);
    },
    [rescheduleEvent]
  );

  // Render the appropriate view
  const renderView = () => {
    const viewProps = {
      items,
      onSlotClick: handleSlotClick,
      onEventClick: handleEventClick,
      onDateClick: handleDateClick,
      onEventDrop: handleEventDrop,
      isLoading,
    };

    switch (viewType) {
      case 'month':
        return <MonthView {...viewProps} />;
      case 'week':
        return <WeekView {...viewProps} />;
      case 'day':
        return <DayView {...viewProps} />;
      case 'agenda':
        return <AgendaView {...viewProps} />;
      default:
        return <MonthView {...viewProps} />;
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden ${className}`}>
      {/* Header */}
      {showHeader && (
        <CalendarHeader
          activeFiltersCount={activeFiltersCount}
          onCreateEvent={() => openEventModal()}
          isSyncing={isSyncingGoogle || isLoading}
          isGoogleConnected={isGoogleConnected}
          onSync={forceSync}
        />
      )}

      {/* Main content area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Calendar view */}
        <div className="flex-1 overflow-auto relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-surface-900/50 flex items-center justify-center z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          )}
          {renderView()}
        </div>

        {/* Filter panel */}
        {showFilters && isFilterPanelOpen && (
          <FilterPanel teamMembers={teamMembers} />
        )}
      </div>

      {/* Event Modal */}
      <EventModal onSuccess={refetch} />
    </div>
  );
}

export default CalendarContainer;

