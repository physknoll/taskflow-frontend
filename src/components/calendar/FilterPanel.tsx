'use client';

import { useState } from 'react';
import { useCalendarStore } from '@/stores/calendarStore';
import { useProjects } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { CalendarEventType } from '@/types/calendar';
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, ALL_EVENT_TYPES } from './constants';
import {
  X,
  ChevronDown,
  ChevronUp,
  Check,
  Users,
  FolderKanban,
  Building2,
  Calendar,
  Eye,
  EyeOff,
} from 'lucide-react';

interface FilterPanelProps {
  onClose?: () => void;
  teamMembers?: Array<{ _id: string; firstName: string; lastName: string; avatar?: string }>;
}

export function FilterPanel({ onClose, teamMembers = [] }: FilterPanelProps) {
  const { filters, setFilters, resetFilters, isFilterPanelOpen, setFilterPanelOpen } =
    useCalendarStore();
  const { projects } = useProjects();
  const { clients } = useClients();

  const [expandedSections, setExpandedSections] = useState({
    eventTypes: true,
    projects: false,
    clients: false,
    team: false,
    visibility: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleEventType = (eventType: CalendarEventType) => {
    const current = filters.eventTypes;
    const updated = current.includes(eventType)
      ? current.filter((t) => t !== eventType)
      : [...current, eventType];
    setFilters({ eventTypes: updated });
  };

  const toggleProject = (projectId: string) => {
    const current = filters.projectIds;
    const updated = current.includes(projectId)
      ? current.filter((id) => id !== projectId)
      : [...current, projectId];
    setFilters({ projectIds: updated });
  };

  const toggleClient = (clientId: string) => {
    const current = filters.clientIds;
    const updated = current.includes(clientId)
      ? current.filter((id) => id !== clientId)
      : [...current, clientId];
    setFilters({ clientIds: updated });
  };

  const toggleAssignee = (userId: string) => {
    const current = filters.assigneeIds;
    const updated = current.includes(userId)
      ? current.filter((id) => id !== userId)
      : [...current, userId];
    setFilters({ assigneeIds: updated });
  };

  const handleClose = () => {
    setFilterPanelOpen(false);
    onClose?.();
  };

  const activeFiltersCount =
    filters.eventTypes.length +
    filters.projectIds.length +
    filters.clientIds.length +
    filters.assigneeIds.length +
    (filters.showCompleted ? 0 : 1) +
    (filters.showExternal ? 0 : 1);

  if (!isFilterPanelOpen) return null;

  return (
    <div className="w-72 border-l border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-surface-900 dark:text-white">Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <button
          onClick={handleClose}
          className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Filter sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Event Types */}
        <FilterSection
          title="Event Types"
          icon={<Calendar className="h-4 w-4" />}
          expanded={expandedSections.eventTypes}
          onToggle={() => toggleSection('eventTypes')}
        >
          <div className="space-y-1">
            {ALL_EVENT_TYPES.map((eventType) => (
              <label
                key={eventType}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={
                    filters.eventTypes.length === 0 ||
                    filters.eventTypes.includes(eventType)
                  }
                  onChange={() => toggleEventType(eventType)}
                  className="hidden"
                />
                <span
                  className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                    filters.eventTypes.length === 0 ||
                    filters.eventTypes.includes(eventType)
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-surface-300 dark:border-surface-600'
                  }`}
                >
                  {(filters.eventTypes.length === 0 ||
                    filters.eventTypes.includes(eventType)) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </span>
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: EVENT_TYPE_COLORS[eventType] }}
                />
                <span className="text-sm text-surface-700 dark:text-surface-300">
                  {EVENT_TYPE_LABELS[eventType]}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Projects */}
        {projects.length > 0 && (
          <FilterSection
            title="Projects"
            icon={<FolderKanban className="h-4 w-4" />}
            expanded={expandedSections.projects}
            onToggle={() => toggleSection('projects')}
          >
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {projects.slice(0, 10).map((project) => (
                <label
                  key={project._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.projectIds.includes(project._id)}
                    onChange={() => toggleProject(project._id)}
                    className="hidden"
                  />
                  <span
                    className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                      filters.projectIds.includes(project._id)
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-surface-300 dark:border-surface-600'
                    }`}
                  >
                    {filters.projectIds.includes(project._id) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </span>
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="text-sm text-surface-700 dark:text-surface-300 truncate">
                    {project.name}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Clients */}
        {clients.length > 0 && (
          <FilterSection
            title="Clients"
            icon={<Building2 className="h-4 w-4" />}
            expanded={expandedSections.clients}
            onToggle={() => toggleSection('clients')}
          >
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {clients.slice(0, 10).map((client) => (
                <label
                  key={client._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.clientIds.includes(client._id)}
                    onChange={() => toggleClient(client._id)}
                    className="hidden"
                  />
                  <span
                    className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                      filters.clientIds.includes(client._id)
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-surface-300 dark:border-surface-600'
                    }`}
                  >
                    {filters.clientIds.includes(client._id) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </span>
                  <span className="text-sm text-surface-700 dark:text-surface-300 truncate">
                    {client.name}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Team Members */}
        {teamMembers.length > 0 && (
          <FilterSection
            title="Team Members"
            icon={<Users className="h-4 w-4" />}
            expanded={expandedSections.team}
            onToggle={() => toggleSection('team')}
          >
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {teamMembers.map((member) => (
                <label
                  key={member._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.assigneeIds.includes(member._id)}
                    onChange={() => toggleAssignee(member._id)}
                    className="hidden"
                  />
                  <span
                    className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                      filters.assigneeIds.includes(member._id)
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-surface-300 dark:border-surface-600'
                    }`}
                  >
                    {filters.assigneeIds.includes(member._id) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </span>
                  <Avatar
                    firstName={member.firstName}
                    lastName={member.lastName}
                    src={member.avatar}
                    size="sm"
                  />
                  <span className="text-sm text-surface-700 dark:text-surface-300 truncate">
                    {member.firstName} {member.lastName}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Visibility */}
        <FilterSection
          title="Visibility"
          icon={<Eye className="h-4 w-4" />}
          expanded={expandedSections.visibility}
          onToggle={() => toggleSection('visibility')}
        >
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showCompleted}
                onChange={(e) => setFilters({ showCompleted: e.target.checked })}
                className="hidden"
              />
              <span
                className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                  filters.showCompleted
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-surface-300 dark:border-surface-600'
                }`}
              >
                {filters.showCompleted && <Check className="h-3 w-3 text-white" />}
              </span>
              <span className="text-sm text-surface-700 dark:text-surface-300">
                Show completed
              </span>
            </label>
            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showExternal}
                onChange={(e) => setFilters({ showExternal: e.target.checked })}
                className="hidden"
              />
              <span
                className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                  filters.showExternal
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-surface-300 dark:border-surface-600'
                }`}
              >
                {filters.showExternal && <Check className="h-3 w-3 text-white" />}
              </span>
              <span className="text-sm text-surface-700 dark:text-surface-300">
                Show Google Calendar events
              </span>
            </label>
          </div>
        </FilterSection>
      </div>

      {/* Footer */}
      {activeFiltersCount > 0 && (
        <div className="p-4 border-t border-surface-200 dark:border-surface-700">
          <Button variant="outline" size="sm" className="w-full" onClick={resetFilters}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper component for filter sections
function FilterSection({
  title,
  icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-3 bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-surface-500 dark:text-surface-400">{icon}</span>
          <span className="text-sm font-medium text-surface-900 dark:text-white">
            {title}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-surface-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-surface-500" />
        )}
      </button>
      {expanded && <div className="p-2">{children}</div>}
    </div>
  );
}

export default FilterPanel;

