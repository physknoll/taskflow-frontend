'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useCalendarStore } from '@/stores/calendarStore';
import { useCalendar } from '@/hooks/useCalendar';
import { useProjects } from '@/hooks/useProjects';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  CalendarEventType,
  CalendarEvent,
  CreateEventDto,
  RecurrenceFrequency,
} from '@/types/calendar';
import {
  EVENT_TYPE_COLORS,
  EVENT_TYPE_LABELS,
  REMINDER_OPTIONS,
  RECURRENCE_OPTIONS,
  DAYS_OF_WEEK,
  MEETING_PROVIDERS,
  ALL_EVENT_TYPES,
} from './constants';
import {
  Calendar,
  Clock,
  MapPin,
  Link as LinkIcon,
  Users,
  Bell,
  Repeat,
  Palette,
  X,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';

interface EventModalProps {
  onSuccess?: () => void;
}

export function EventModal({ onSuccess }: EventModalProps) {
  const {
    isEventModalOpen,
    selectedEvent,
    isCreating,
    createEventSlot,
    closeEventModal,
  } = useCalendarStore();

  const { createEvent, updateEvent, deleteEvent, isCreating: isSaving, isDeleting } =
    useCalendar();
  const { projects } = useProjects();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<CalendarEventType>('meeting');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingProvider, setMeetingProvider] = useState<string>('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [color, setColor] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] =
    useState<RecurrenceFrequency>('weekly');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [reminders, setReminders] = useState<number[]>([15]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form when modal opens
  useEffect(() => {
    if (isEventModalOpen) {
      if (selectedEvent) {
        // Editing existing event
        const event = selectedEvent;
        setTitle(event.title);
        setDescription(event.description || '');
        setEventType(event.eventType);
        setStartDate(format(new Date(event.startTime), 'yyyy-MM-dd'));
        setStartTime(format(new Date(event.startTime), 'HH:mm'));
        setEndDate(format(new Date(event.endTime), 'yyyy-MM-dd'));
        setEndTime(format(new Date(event.endTime), 'HH:mm'));
        setAllDay(event.allDay);
        setProjectId(event.projectId?._id || '');
        setLocation(event.location || '');
        setMeetingLink(event.meetingLink || '');
        setMeetingProvider(event.meetingProvider || '');
        setPriority(event.priority);
        setColor(event.color || '');
        setRecurring(event.recurring);
        if (event.recurrenceRule) {
          setRecurrenceFrequency(event.recurrenceRule.frequency);
          setRecurrenceInterval(event.recurrenceRule.interval);
        }
        setReminders(event.reminders?.map((r) => r.minutesBefore) || [15]);
      } else if (createEventSlot) {
        // Creating new event with slot
        setTitle('');
        setDescription('');
        setEventType('meeting');
        setStartDate(format(createEventSlot.start, 'yyyy-MM-dd'));
        setStartTime(format(createEventSlot.start, 'HH:mm'));
        setEndDate(format(createEventSlot.end, 'yyyy-MM-dd'));
        setEndTime(format(createEventSlot.end, 'HH:mm'));
        setAllDay(createEventSlot.allDay || false);
        setProjectId('');
        setLocation('');
        setMeetingLink('');
        setMeetingProvider('');
        setPriority('medium');
        setColor('');
        setRecurring(false);
        setReminders([15]);
      } else {
        // Creating new event without slot
        const now = new Date();
        const later = new Date(now.getTime() + 60 * 60 * 1000);
        setTitle('');
        setDescription('');
        setEventType('meeting');
        setStartDate(format(now, 'yyyy-MM-dd'));
        setStartTime(format(now, 'HH:mm'));
        setEndDate(format(later, 'yyyy-MM-dd'));
        setEndTime(format(later, 'HH:mm'));
        setAllDay(false);
        setProjectId('');
        setLocation('');
        setMeetingLink('');
        setMeetingProvider('');
        setPriority('medium');
        setColor('');
        setRecurring(false);
        setReminders([15]);
      }
      setShowDeleteConfirm(false);
    }
  }, [isEventModalOpen, selectedEvent, createEventSlot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const startDateTime = allDay
      ? `${startDate}T00:00:00.000Z`
      : `${startDate}T${startTime}:00.000Z`;
    const endDateTime = allDay
      ? `${endDate}T23:59:59.000Z`
      : `${endDate}T${endTime}:00.000Z`;

    const eventData: CreateEventDto = {
      title,
      description: description || undefined,
      eventType,
      startTime: startDateTime,
      endTime: endDateTime,
      allDay,
      projectId: projectId || undefined,
      location: location || undefined,
      meetingLink: meetingLink || undefined,
      meetingProvider: meetingProvider as any || undefined,
      priority,
      color: color || undefined,
      recurring,
      recurrenceRule: recurring
        ? {
            frequency: recurrenceFrequency,
            interval: recurrenceInterval,
            endType: 'never',
          }
        : undefined,
      reminders: reminders.map((minutes) => ({
        type: 'push' as const,
        minutesBefore: minutes,
      })),
    };

    try {
      if (selectedEvent) {
        await updateEvent({ id: selectedEvent._id, data: eventData });
      } else {
        await createEvent(eventData);
      }
      closeEventModal();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    try {
      await deleteEvent({ id: selectedEvent._id });
      closeEventModal();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const addReminder = () => {
    if (reminders.length < 5) {
      setReminders([...reminders, 30]);
    }
  };

  const removeReminder = (index: number) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  const updateReminder = (index: number, value: number) => {
    const updated = [...reminders];
    updated[index] = value;
    setReminders(updated);
  };

  return (
    <Modal
      isOpen={isEventModalOpen}
      onClose={closeEventModal}
      title={isCreating ? 'Create Event' : 'Edit Event'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <Input
            label="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter event title"
            required
          />
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Event Type
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_EVENT_TYPES.filter((t) => t !== 'external').map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setEventType(type)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  eventType === type
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: EVENT_TYPE_COLORS[type] }}
                />
                <span className="text-sm">{EVENT_TYPE_LABELS[type]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-surface-700 dark:text-surface-300">
                All day
              </span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            {!allDay && (
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Start Time
                </label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            {!allDay && (
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  End Time
                </label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Add description (optional)"
          />
        </div>

        {/* Project */}
        {projects.length > 0 && (
          <div>
            <Select
              label="Link to Project"
              options={[
                { value: '', label: 'No project' },
                ...projects.map((p) => ({ value: p._id, label: p.name })),
              ]}
              value={projectId}
              onChange={setProjectId}
            />
          </div>
        )}

        {/* Location & Meeting Link */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-surface-500" />
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                Location
              </label>
            </div>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LinkIcon className="h-4 w-4 text-surface-500" />
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                Meeting Link
              </label>
            </div>
            <Input
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="Add meeting link"
            />
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Priority
          </label>
          <div className="flex gap-3">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium capitalize transition-colors ${
                  priority === p
                    ? p === 'high'
                      ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                      : p === 'medium'
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
                      : 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                    : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Recurring */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            />
            <Repeat className="h-4 w-4 text-surface-500" />
            <span className="text-sm text-surface-700 dark:text-surface-300">
              Repeat event
            </span>
          </label>

          {recurring && (
            <div className="flex items-center gap-3 pl-6">
              <span className="text-sm text-surface-600 dark:text-surface-400">
                Every
              </span>
              <Input
                type="number"
                min={1}
                max={99}
                value={recurrenceInterval}
                onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <Select
                options={RECURRENCE_OPTIONS}
                value={recurrenceFrequency}
                onChange={(val) => setRecurrenceFrequency(val as RecurrenceFrequency)}
              />
            </div>
          )}
        </div>

        {/* Reminders */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-surface-500" />
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                Reminders
              </span>
            </div>
            {reminders.length < 5 && (
              <button
                type="button"
                onClick={addReminder}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add reminder
              </button>
            )}
          </div>
          <div className="space-y-2">
            {reminders.map((minutes, index) => (
              <div key={index} className="flex items-center gap-2">
                <Select
                  options={REMINDER_OPTIONS}
                  value={String(minutes)}
                  onChange={(val) => updateReminder(index, parseInt(val as string))}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeReminder(index)}
                  className="p-2 text-surface-500 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-surface-200 dark:border-surface-700">
          {selectedEvent ? (
            <div>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600">Delete this event?</span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={closeEventModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !title}>
              {isSaving
                ? 'Saving...'
                : selectedEvent
                ? 'Save Changes'
                : 'Create Event'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default EventModal;

