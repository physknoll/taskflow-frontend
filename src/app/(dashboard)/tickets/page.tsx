'use client';

import { useState } from 'react';
import { useTickets } from '@/hooks/useTickets';
import { useClients } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { useUIStore } from '@/stores/uiStore';
import { useTicketStore } from '@/stores/ticketStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { TicketBoard } from '@/components/tickets/TicketBoard';
import { CreateTicketModal } from '@/components/tickets/CreateTicketModal';
import { TICKET_PRIORITIES, TICKET_TYPES, TICKET_STATUSES } from '@/lib/constants';
import { ITicketProject } from '@/types';
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  X,
  SlidersHorizontal,
  FolderKanban,
} from 'lucide-react';

// Helper to check if project is populated
function isPopulatedProject(project: any): project is ITicketProject {
  return project !== null && typeof project === 'object' && 'name' in project;
}

export default function TicketsPage() {
  const { tickets, isLoading, updateTicketStatus, filters, updateFilters } = useTickets();
  const { clients } = useClients();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { ticketViewMode, setTicketViewMode } = useUIStore();
  const { isCreateModalOpen } = useTicketStore();
  const [showFilters, setShowFilters] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    await updateTicketStatus(ticketId, newStatus);
  };

  const clearFilters = () => {
    updateFilters({
      client: undefined,
      project: undefined,
      status: undefined,
      priority: undefined,
      type: undefined,
      search: '',
    });
  };

  const hasActiveFilters = filters.client || filters.project || filters.status || filters.priority || filters.type || filters.search;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tickets"
        description="Manage and track all your project tasks"
        action={
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search and Filters */}
        <div className="flex flex-1 gap-3 w-full lg:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={filters.search || ''}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="primary" size="sm" className="ml-1">
                Active
              </Badge>
            )}
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 border border-surface-300 dark:border-surface-600 rounded-lg p-1">
          <button
            onClick={() => setTicketViewMode('board')}
            className={`p-2 rounded ${
              ticketViewMode === 'board'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTicketViewMode('list')}
            className={`p-2 rounded ${
              ticketViewMode === 'list'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl border border-surface-200 dark:border-surface-700 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-surface-900 dark:text-white">Filters</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select
              label="Client"
              options={[
                { value: '', label: 'All clients' },
                ...clients.map((c) => ({ value: c._id, label: c.name })),
              ]}
              value={filters.client || ''}
              onChange={(val) => updateFilters({ client: val || undefined })}
            />
            <Select
              label="Project"
              options={[
                { value: '', label: 'All projects' },
                { value: 'standalone', label: '📌 Standalone Tasks' },
                ...projects.map((p) => ({ 
                  value: p._id, 
                  label: p.name,
                })),
              ]}
              value={filters.project || ''}
              onChange={(val) => updateFilters({ project: val || undefined })}
            />
            <Select
              label="Status"
              options={[
                { value: '', label: 'All statuses' },
                ...TICKET_STATUSES.map((s) => ({ value: s.id, label: s.label })),
              ]}
              value={filters.status || ''}
              onChange={(val) => updateFilters({ status: val || undefined })}
            />
            <Select
              label="Priority"
              options={[
                { value: '', label: 'All priorities' },
                ...TICKET_PRIORITIES.map((p) => ({ value: p.id, label: p.label })),
              ]}
              value={filters.priority || ''}
              onChange={(val) => updateFilters({ priority: val || undefined })}
            />
            <Select
              label="Type"
              options={[
                { value: '', label: 'All types' },
                ...TICKET_TYPES.map((t) => ({ value: t.id, label: `${t.icon} ${t.label}` })),
              ]}
              value={filters.type || ''}
              onChange={(val) => updateFilters({ type: val || undefined })}
            />
          </div>
        </div>
      )}

      {/* Ticket Board or List */}
      {ticketViewMode === 'board' ? (
        <TicketBoard
          tickets={tickets}
          isLoading={isLoading}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <TicketListView tickets={tickets} isLoading={isLoading} />
      )}

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={createModalOpen || isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}

// Simple list view component
function TicketListView({ tickets, isLoading }: { tickets: any[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 bg-white dark:bg-surface-800 rounded-lg animate-pulse">
            <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/4 mb-2" />
            <div className="h-5 bg-surface-200 dark:bg-surface-700 rounded w-3/4 mb-2" />
            <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-surface-800 rounded-xl">
        <p className="text-surface-500 dark:text-surface-400">No tickets found</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
      <table className="w-full">
        <thead className="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
          <tr>
            <th className="text-left py-3 px-4 text-sm font-medium text-surface-600 dark:text-surface-400">Ticket</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-surface-600 dark:text-surface-400">Project</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-surface-600 dark:text-surface-400">Client</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-surface-600 dark:text-surface-400">Status</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-surface-600 dark:text-surface-400">Priority</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-surface-600 dark:text-surface-400">Due Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
          {tickets.map((ticket) => (
            <tr key={ticket._id} className="hover:bg-surface-50 dark:hover:bg-surface-700/50">
              <td className="py-3 px-4">
                <a href={`/tickets/${ticket._id}`} className="block">
                  <span className="text-xs font-mono text-surface-500 dark:text-surface-400 block">
                    {ticket.ticketNumber}
                  </span>
                  <span className="font-medium text-surface-900 dark:text-white">
                    {ticket.title}
                  </span>
                </a>
              </td>
              <td className="py-3 px-4">
                {isPopulatedProject(ticket.project) ? (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ticket.project.color }}
                    />
                    <span className="text-sm text-surface-600 dark:text-surface-400 truncate max-w-[120px]">
                      {ticket.project.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-surface-400 dark:text-surface-500">—</span>
                )}
              </td>
              <td className="py-3 px-4 text-sm text-surface-600 dark:text-surface-400">
                {typeof ticket.client === 'object' ? ticket.client.name : 'Unknown'}
              </td>
              <td className="py-3 px-4">
                <Badge className={`status-${ticket.status}`} size="sm">
                  {ticket.status.replace('_', ' ')}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <Badge className={`priority-${ticket.priority}`} size="sm">
                  {ticket.priority}
                </Badge>
              </td>
              <td className="py-3 px-4 text-sm text-surface-600 dark:text-surface-400">
                {ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

