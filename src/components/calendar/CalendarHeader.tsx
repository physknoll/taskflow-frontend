'use client';

import { format } from 'date-fns';
import { useCalendarStore } from '@/stores/calendarStore';
import { Button } from '@/components/ui/Button';
import { CalendarViewType } from '@/types/calendar';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  LayoutGrid,
  Columns3,
  CalendarDays,
  List,
  Filter,
  Plus,
  X,
} from 'lucide-react';

interface CalendarHeaderProps {
  onCreateEvent?: () => void;
  showCreateButton?: boolean;
  activeFiltersCount?: number;
}

export function CalendarHeader({
  onCreateEvent,
  showCreateButton = true,
  activeFiltersCount = 0,
}: CalendarHeaderProps) {
  const {
    selectedDate,
    viewType,
    setViewType,
    navigatePrev,
    navigateNext,
    navigateToday,
    isFilterPanelOpen,
    toggleFilterPanel,
    openEventModal,
  } = useCalendarStore();

  // Format the header title based on view type
  const getHeaderTitle = () => {
    switch (viewType) {
      case 'month':
        return format(selectedDate, 'MMMM yyyy');
      case 'week':
        return `Week of ${format(selectedDate, 'MMM d, yyyy')}`;
      case 'day':
        return format(selectedDate, 'EEEE, MMMM d, yyyy');
      case 'agenda':
        return `Agenda - ${format(selectedDate, 'MMM d, yyyy')}`;
      default:
        return format(selectedDate, 'MMMM yyyy');
    }
  };

  const viewOptions: { id: CalendarViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'month', label: 'Month', icon: <LayoutGrid className="h-4 w-4" /> },
    { id: 'week', label: 'Week', icon: <Columns3 className="h-4 w-4" /> },
    { id: 'day', label: 'Day', icon: <CalendarDays className="h-4 w-4" /> },
    { id: 'agenda', label: 'Agenda', icon: <List className="h-4 w-4" /> },
  ];

  const handleCreateEvent = () => {
    if (onCreateEvent) {
      onCreateEvent();
    } else {
      openEventModal();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900">
      {/* Left side - Navigation */}
      <div className="flex items-center gap-3">
        {/* Today button */}
        <Button variant="outline" size="sm" onClick={navigateToday}>
          Today
        </Button>

        {/* Prev/Next navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={navigatePrev}
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={navigateNext}
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
          {getHeaderTitle()}
        </h2>
      </div>

      {/* Right side - View toggle & actions */}
      <div className="flex items-center gap-3">
        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-lg">
          {viewOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setViewType(option.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewType === option.id
                  ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
              }`}
              title={option.label}
            >
              {option.icon}
              <span className="hidden lg:inline">{option.label}</span>
            </button>
          ))}
        </div>

        {/* Filter button */}
        <button
          onClick={toggleFilterPanel}
          className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
            isFilterPanelOpen
              ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-300'
              : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'
          }`}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline text-sm font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-500 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Create Event button */}
        {showCreateButton && (
          <Button onClick={handleCreateEvent} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Event</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export default CalendarHeader;

