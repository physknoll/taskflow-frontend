'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsService, KnowledgeBaseDocument, KNOWLEDGE_BASE_CATEGORIES } from '@/services/clients.service';
import { ticketsService } from '@/services/tickets.service';
import { BulkUploadModal, KBSourcesList } from '@/components/clients';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  ArrowLeft,
  Building,
  Globe,
  Mail,
  Phone,
  User,
  Users,
  Ticket,
  FileText,
  Palette,
  Settings,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Upload,
  File,
  Search,
  MessageSquare,
  Send,
  X,
  FolderOpen,
  FolderUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const clientId = params.id as string;

  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'contacts' | 'documents' | 'brand'>('overview');

  // Fetch client
  const { data: client, isLoading, error } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientsService.getClient(clientId),
    enabled: !!clientId,
  });

  // Fetch client's tickets
  const { data: ticketsData } = useQuery({
    queryKey: ['tickets', { client: clientId }],
    queryFn: () => ticketsService.getTickets({ client: clientId }),
    enabled: !!clientId,
  });

  const tickets = ticketsData?.data || [];

  if (isLoading) {
    return <ClientDetailSkeleton />;
  }

  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building className="h-16 w-16 text-surface-300 mb-4" />
        <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
          Client not found
        </h2>
        <p className="text-surface-500 mb-4">
          The client you are looking for does not exist or you do not have access.
        </p>
        <Button onClick={() => router.push('/clients')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </Button>
      </div>
    );
  }

  // Stats
  const totalTickets = tickets.length;
  const completedTickets = tickets.filter(t => t.status === 'completed').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const overdueTickets = tickets.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building },
    { id: 'tickets', label: 'Tickets', icon: Ticket, count: totalTickets },
    { id: 'contacts', label: 'Contacts', icon: Users, count: client.contacts?.length || 0 },
    { id: 'documents', label: 'Documents', icon: FileText, count: client.knowledgeBase?.documentCount || 0 },
    { id: 'brand', label: 'Brand', icon: Palette },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push('/clients')}
        className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Clients
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6">
        <div className="flex items-start gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            {client.logo ? (
              <img
                src={client.logo}
                alt={client.name}
                className="w-20 h-20 rounded-xl object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {client.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
                {client.name}
              </h1>
              <Badge variant={client.isActive ? 'success' : 'secondary'}>
                {client.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            
            {client.description && (
              <p className="text-surface-600 dark:text-surface-400 mb-4 line-clamp-2">
                {client.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-surface-500">
              {client.website && (
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-primary-600 transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  {client.website.replace(/^https?:\/\//, '')}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {client.industry && (
                <span className="flex items-center gap-1.5">
                  <Building className="h-4 w-4" />
                  {client.industry}
                </span>
              )}
              {client.primaryContact?.email && (
                <a
                  href={`mailto:${client.primaryContact.email}`}
                  className="flex items-center gap-1.5 hover:text-primary-600 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  {client.primaryContact.email}
                </a>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-surface-200 dark:border-surface-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{totalTickets}</p>
            <p className="text-sm text-surface-500">Total Tickets</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{completedTickets}</p>
            <p className="text-sm text-surface-500">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{inProgressTickets}</p>
            <p className="text-sm text-surface-500">In Progress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{overdueTickets}</p>
            <p className="text-sm text-surface-500">Overdue</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.count !== undefined && (
              <Badge variant="secondary" size="sm">{tab.count}</Badge>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab client={client} />
      )}
      
      {activeTab === 'tickets' && (
        <TicketsTab tickets={tickets} clientId={clientId} />
      )}
      
      {activeTab === 'contacts' && (
        <ContactsTab client={client} clientId={clientId} />
      )}
      
      {activeTab === 'documents' && (
        <DocumentsTab clientId={clientId} />
      )}
      
      {activeTab === 'brand' && (
        <BrandTab client={client} />
      )}
    </div>
  );
}

function OverviewTab({ client }: { client: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Primary Contact */}
      <Card>
        <h3 className="font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-primary-500" />
          Primary Contact
        </h3>
        {client.primaryContact ? (
          <div className="space-y-3">
            <p className="font-medium text-surface-900 dark:text-white">
              {client.primaryContact.name}
            </p>
            {client.primaryContact.role && (
              <p className="text-sm text-surface-500">{client.primaryContact.role}</p>
            )}
            <div className="space-y-2 text-sm">
              {client.primaryContact.email && (
                <a
                  href={`mailto:${client.primaryContact.email}`}
                  className="flex items-center gap-2 text-surface-600 dark:text-surface-400 hover:text-primary-600"
                >
                  <Mail className="h-4 w-4" />
                  {client.primaryContact.email}
                </a>
              )}
              {client.primaryContact.phone && (
                <a
                  href={`tel:${client.primaryContact.phone}`}
                  className="flex items-center gap-2 text-surface-600 dark:text-surface-400 hover:text-primary-600"
                >
                  <Phone className="h-4 w-4" />
                  {client.primaryContact.phone}
                </a>
              )}
            </div>
          </div>
        ) : (
          <p className="text-surface-400 text-sm">No primary contact set</p>
        )}
      </Card>

      {/* Services */}
      <Card>
        <h3 className="font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary-500" />
          Active Services
        </h3>
        {client.services && client.services.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {client.services
              .filter((s: any) => s.isActive)
              .map((service: any, index: number) => (
                <Badge key={index} variant="secondary">
                  {service.type}
                </Badge>
              ))}
          </div>
        ) : (
          <p className="text-surface-400 text-sm">No services configured</p>
        )}
      </Card>

      {/* Knowledge Base */}
      <Card>
        <h3 className="font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary-500" />
          Knowledge Base
        </h3>
        <div className="space-y-3">
          <p className="text-2xl font-bold text-surface-900 dark:text-white">
            {client.knowledgeBase?.documentCount || 0}
          </p>
          <p className="text-sm text-surface-500">Documents uploaded</p>
          {client.knowledgeBase?.categories?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {client.knowledgeBase.categories.map((cat: string) => (
                <Badge key={cat} variant="secondary" size="sm">
                  {cat}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Settings */}
      <Card>
        <h3 className="font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary-500" />
          Settings
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-surface-500">Default Priority</span>
            <Badge variant="secondary">{client.settings?.defaultPriority || 'medium'}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-500">Require Review</span>
            <span className="text-surface-900 dark:text-white">
              {client.settings?.requireReviewForAll ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-500">Auto-Assign</span>
            <span className="text-surface-900 dark:text-white">
              {client.settings?.autoAssignTickets ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function TicketsTab({ tickets, clientId }: { tickets: any[]; clientId: string }) {
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700">
      <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
        <h3 className="font-semibold text-surface-900 dark:text-white">
          Recent Tickets
        </h3>
        <Button size="sm" onClick={() => router.push(`/tickets?client=${clientId}`)}>
          View All
        </Button>
      </div>
      
      {tickets.length === 0 ? (
        <div className="p-8 text-center text-surface-400">
          <Ticket className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No tickets for this client</p>
        </div>
      ) : (
        <div className="divide-y divide-surface-200 dark:divide-surface-700">
          {tickets.slice(0, 10).map((ticket) => (
            <div
              key={ticket._id}
              onClick={() => router.push(`/tickets/${ticket._id}`)}
              className="p-4 hover:bg-surface-50 dark:hover:bg-surface-700/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-mono text-surface-400 mb-1">
                    {ticket.ticketNumber}
                  </p>
                  <p className="font-medium text-surface-900 dark:text-white truncate">
                    {ticket.title}
                  </p>
                </div>
                <Badge
                  className={cn(
                    ticket.status === 'completed' && 'bg-green-100 text-green-700',
                    ticket.status === 'in_progress' && 'bg-amber-100 text-amber-700',
                    ticket.status === 'in_review' && 'bg-violet-100 text-violet-700',
                    ticket.status === 'todo' && 'bg-primary-100 text-primary-700',
                    ticket.status === 'backlog' && 'bg-surface-100 text-surface-700'
                  )}
                  size="sm"
                >
                  {ticket.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContactsTab({ client, clientId }: { client: any; clientId: string }) {
  const contacts = client.contacts || [];
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state for new contact
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactDepartment, setContactDepartment] = useState('');
  const [contactIsDecisionMaker, setContactIsDecisionMaker] = useState(false);
  const [contactNotes, setContactNotes] = useState('');

  const addMutation = useMutation({
    mutationFn: (contact: any) => clientsService.addContact(clientId, contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      toast.success('Contact added');
      setShowAddModal(false);
      // Reset form
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactRole('');
      setContactDepartment('');
      setContactIsDecisionMaker(false);
      setContactNotes('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add contact');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (contactIndex: number) => clientsService.removeContact(clientId, contactIndex),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      toast.success('Contact removed');
    },
    onError: () => {
      toast.error('Failed to remove contact');
    },
  });

  const handleAddContact = () => {
    if (!contactName.trim() || !contactEmail.trim() || !contactRole.trim()) {
      toast.error('Name, email, and role are required');
      return;
    }

    addMutation.mutate({
      name: contactName,
      email: contactEmail,
      phone: contactPhone || undefined,
      role: contactRole,
      department: contactDepartment || undefined,
      isDecisionMaker: contactIsDecisionMaker,
      notes: contactNotes || undefined,
    });
  };

  return (
    <>
      <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700">
        <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
          <h3 className="font-semibold text-surface-900 dark:text-white">
            Contacts ({contacts.length})
          </h3>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
        
        {contacts.length === 0 ? (
          <div className="p-8 text-center text-surface-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No contacts added</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-200 dark:divide-surface-700">
            {contacts.map((contact: any, index: number) => (
              <div key={index} className="p-4 flex items-center gap-4">
                <Avatar
                  firstName={contact.name.split(' ')[0]}
                  lastName={contact.name.split(' ')[1] || ''}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-surface-900 dark:text-white">
                      {contact.name}
                    </p>
                    {contact.isDecisionMaker && (
                      <Badge variant="primary" size="sm">Decision Maker</Badge>
                    )}
                  </div>
                  <p className="text-sm text-surface-500">{contact.role}</p>
                  <div className="flex gap-4 mt-1 text-sm text-surface-400">
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="hover:text-primary-600">
                        {contact.email}
                      </a>
                    )}
                    {contact.phone && (
                      <a href={`tel:${contact.phone}`} className="hover:text-primary-600">
                        {contact.phone}
                      </a>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Remove this contact?')) {
                      deleteMutation.mutate(index);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-surface-400 hover:text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Contact"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name *"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="John Smith"
            />
            <Input
              label="Email *"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Role *"
              value={contactRole}
              onChange={(e) => setContactRole(e.target.value)}
              placeholder="Marketing Director"
            />
            <Input
              label="Phone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+1-555-1234"
            />
          </div>

          <Input
            label="Department"
            value={contactDepartment}
            onChange={(e) => setContactDepartment(e.target.value)}
            placeholder="Marketing"
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isDecisionMaker"
              checked={contactIsDecisionMaker}
              onChange={(e) => setContactIsDecisionMaker(e.target.checked)}
              className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isDecisionMaker" className="text-sm text-surface-700 dark:text-surface-300">
              This contact is a decision maker
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Notes
            </label>
            <textarea
              value={contactNotes}
              onChange={(e) => setContactNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddContact} disabled={addMutation.isPending}>
              {addMutation.isPending ? 'Adding...' : 'Add Contact'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function DocumentsTab({ clientId }: { clientId: string }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Sub-tab navigation state
  const [activeSubTab, setActiveSubTab] = useState<'files' | 'sources'>('files');
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showAddTextModal, setShowAddTextModal] = useState(false);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('general');
  const [uploadTags, setUploadTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // Text document form
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docCategory, setDocCategory] = useState('general');
  const [docContentType, setDocContentType] = useState<'markdown' | 'text' | 'html'>('markdown');
  
  // Query form
  const [queryQuestion, setQueryQuestion] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState({ current: 0, total: 0 });

  // Reset page and selection when category changes
  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [selectedCategory]);

  // Reset selection when page changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [page]);

  // Fetch documents with pagination
  const { data: documentsData, isLoading, refetch } = useQuery({
    queryKey: ['knowledge-base', clientId, selectedCategory, page, pageSize],
    queryFn: () => clientsService.getKnowledgeBase(clientId, { 
      category: selectedCategory || undefined,
      page,
      limit: pageSize,
    }),
    enabled: !!clientId,
  });

  // Get documents from paginated response
  const documents = documentsData?.data || [];
  const totalDocuments = documentsData?.total || 0;
  const totalPages = Math.ceil(totalDocuments / pageSize);

  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: ({ file, category, tags }: { file: File; category: string; tags?: string }) =>
      clientsService.uploadFile(clientId, file, category, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      toast.success('File uploaded successfully');
      setShowUploadModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    },
  });

  // Add text document mutation
  const addDocMutation = useMutation({
    mutationFn: (data: any) => clientsService.addDocument(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      toast.success('Document added successfully');
      setShowAddTextModal(false);
      setDocTitle('');
      setDocContent('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add document');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => clientsService.deleteDocument(clientId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      toast.success('Document deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete document');
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['.txt', '.md', '.html', '.json'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(ext)) {
      toast.error('Only .txt, .md, .html, and .json files are allowed');
      return;
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setShowUploadModal(true);
  };

  const handleUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    uploadMutation.mutate({
      file,
      category: uploadCategory,
      tags: uploadTags || undefined,
    });
  };

  const handleAddDocument = () => {
    if (!docTitle.trim() || !docContent.trim()) {
      toast.error('Title and content are required');
      return;
    }

    addDocMutation.mutate({
      title: docTitle,
      content: docContent,
      category: docCategory,
      contentType: docContentType,
    });
  };

  const handleQuery = async () => {
    if (!queryQuestion.trim()) return;

    setIsQuerying(true);
    try {
      const result = await clientsService.queryKnowledgeBase(clientId, queryQuestion);
      setQueryResult(result);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to query knowledge base');
    } finally {
      setIsQuerying(false);
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return KNOWLEDGE_BASE_CATEGORIES.find(c => c.id === categoryId) || { label: categoryId, icon: '📄' };
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Selection helpers
  const toggleSelectAll = () => {
    if (selectedIds.size === documents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(documents.map((doc: KnowledgeBaseDocument) => doc._id)));
    }
  };

  const toggleSelectOne = (docId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const isAllSelected = documents.length > 0 && selectedIds.size === documents.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < documents.length;

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    const confirmed = confirm(`Are you sure you want to delete ${selectedIds.size} document${selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.`);
    if (!confirmed) return;

    setIsDeleting(true);
    setDeleteProgress({ current: 0, total: selectedIds.size });
    
    const idsToDelete = Array.from(selectedIds);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < idsToDelete.length; i++) {
      setDeleteProgress({ current: i + 1, total: idsToDelete.length });
      try {
        await clientsService.deleteDocument(clientId, idsToDelete[i]);
        successCount++;
        
        // Remove from selection and refetch immediately so item disappears
        setSelectedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(idsToDelete[i]);
          return newSet;
        });
        await queryClient.invalidateQueries({ queryKey: ['knowledge-base', clientId] });
      } catch (error) {
        failCount++;
        console.error(`Failed to delete document ${idsToDelete[i]}:`, error);
      }
    }

    setIsDeleting(false);
    
    // Final refresh for client stats
    queryClient.invalidateQueries({ queryKey: ['client', clientId] });

    if (failCount === 0) {
      toast.success(`Successfully deleted ${successCount} document${successCount > 1 ? 's' : ''}`);
    } else {
      toast.error(`Deleted ${successCount} document${successCount > 1 ? 's' : ''}, ${failCount} failed`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveSubTab('files')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeSubTab === 'files'
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
            )}
          >
            <File className="h-4 w-4" />
            Files
          </button>
          <button
            onClick={() => setActiveSubTab('sources')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeSubTab === 'sources'
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
            )}
          >
            <Globe className="h-4 w-4" />
            Sources
          </button>
        </div>
      </div>

      {/* Sources Sub-Tab */}
      {activeSubTab === 'sources' && (
        <KBSourcesList clientId={clientId} />
      )}

      {/* Files Sub-Tab */}
      {activeSubTab === 'files' && (
        <>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <Select
                options={[
                  { value: '', label: 'All Categories' },
                  ...KNOWLEDGE_BASE_CATEGORIES.map(c => ({ value: c.id, label: `${c.icon} ${c.label}` })),
                ]}
                value={selectedCategory}
                onChange={setSelectedCategory}
                className="w-48"
              />
              
              {/* Select All Checkbox */}
              {documents.length > 0 && (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                    disabled={isDeleting}
                  />
                  <span className="text-sm text-surface-600 dark:text-surface-400">
                    Select All ({documents.length})
                  </span>
                </label>
              )}
              
              {/* Delete Selected Button */}
              {selectedIds.size > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting 
                    ? `Deleting ${deleteProgress.current}/${deleteProgress.total}...`
                    : `Delete Selected (${selectedIds.size})`
                  }
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowQueryModal(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Ask AI
              </Button>
              <Button variant="outline" onClick={() => setShowAddTextModal(true)}>
                <FileText className="h-4 w-4 mr-2" />
                Add Text
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
              <Button onClick={() => setShowBulkUploadModal(true)}>
                <FolderUp className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.html,.json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

      {/* Documents List */}
      <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton variant="rounded" width={48} height={48} />
                <div className="flex-1">
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="60%" className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen className="h-16 w-16 mx-auto mb-4 text-surface-300" />
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
              No documents yet
            </h3>
            <p className="text-surface-500 mb-6 max-w-md mx-auto">
              {`Upload files or add text documents to build this client's knowledge base for AI assistance.`}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setShowAddTextModal(true)}>
                <FileText className="h-4 w-4 mr-2" />
                Add Text Document
              </Button>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-surface-200 dark:divide-surface-700">
            {documents.map((doc: KnowledgeBaseDocument) => {
              const category = getCategoryInfo(doc.category);
              const isSelected = selectedIds.has(doc._id);
              return (
                <div 
                  key={doc._id} 
                  className={cn(
                    "p-4 flex items-center gap-4 transition-colors",
                    isSelected 
                      ? "bg-primary-50 dark:bg-primary-900/20" 
                      : "hover:bg-surface-50 dark:hover:bg-surface-700/50"
                  )}
                >
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectOne(doc._id)}
                    className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500 flex-shrink-0"
                    disabled={isDeleting}
                  />
                  <div className="w-12 h-12 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-2xl flex-shrink-0">
                    {category.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-surface-900 dark:text-white truncate">
                        {doc.title}
                      </h4>
                      <Badge variant="secondary" size="sm">
                        {category.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-surface-500">
                      <span>{doc.contentType}</span>
                      {doc.fileSize && <span>{formatFileSize(doc.fileSize)}</span>}
                      <span>{formatDate(doc.createdAt)}</span>
                    </div>
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {doc.tags.map(tag => (
                          <Badge key={tag} variant="secondary" size="sm" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Delete this document?')) {
                        deleteMutation.mutate(doc._id);
                      }
                    }}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 text-surface-400 hover:text-red-500" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {documents.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
          <div className="flex items-center gap-4 text-sm text-surface-600 dark:text-surface-400">
            <span>
              Showing {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, totalDocuments)} of {totalDocuments} documents
            </span>
            <div className="flex items-center gap-2">
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {/* First page */}
              {page > 2 && (
                <>
                  <button
                    onClick={() => setPage(1)}
                    className="px-3 py-1 text-sm rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400"
                  >
                    1
                  </button>
                  {page > 3 && <span className="px-1 text-surface-400">...</span>}
                </>
              )}
              
              {/* Previous page */}
              {page > 1 && (
                <button
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 text-sm rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400"
                >
                  {page - 1}
                </button>
              )}
              
              {/* Current page */}
              <button
                className="px-3 py-1 text-sm rounded-lg bg-primary-500 text-white font-medium"
              >
                {page}
              </button>
              
              {/* Next page */}
              {page < totalPages && (
                <button
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 text-sm rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400"
                >
                  {page + 1}
                </button>
              )}
              
              {/* Last page */}
              {page < totalPages - 1 && (
                <>
                  {page < totalPages - 2 && <span className="px-1 text-surface-400">...</span>}
                  <button
                    onClick={() => setPage(totalPages)}
                    className="px-3 py-1 text-sm rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload File"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
              Selected file: <span className="font-medium">{fileInputRef.current?.files?.[0]?.name}</span>
            </p>
          </div>
          
          <Select
            label="Category"
            options={KNOWLEDGE_BASE_CATEGORIES.map(c => ({ value: c.id, label: `${c.icon} ${c.label}` }))}
            value={uploadCategory}
            onChange={setUploadCategory}
          />
          
          <Input
            label="Tags (comma-separated)"
            value={uploadTags}
            onChange={(e) => setUploadTags(e.target.value)}
            placeholder="brand, guidelines, colors"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Text Document Modal */}
      <Modal
        isOpen={showAddTextModal}
        onClose={() => setShowAddTextModal(false)}
        title="Add Text Document"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            placeholder="Document title"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              options={KNOWLEDGE_BASE_CATEGORIES.map(c => ({ value: c.id, label: `${c.icon} ${c.label}` }))}
              value={docCategory}
              onChange={setDocCategory}
            />
            <Select
              label="Content Type"
              options={[
                { value: 'markdown', label: 'Markdown' },
                { value: 'text', label: 'Plain Text' },
                { value: 'html', label: 'HTML' },
              ]}
              value={docContentType}
              onChange={(val) => setDocContentType(val as any)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Content
            </label>
            <textarea
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              placeholder="Enter document content..."
              rows={12}
              className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddTextModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDocument} disabled={addDocMutation.isPending}>
              {addDocMutation.isPending ? 'Adding...' : 'Add Document'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Query Modal */}
      <Modal
        isOpen={showQueryModal}
        onClose={() => {
          setShowQueryModal(false);
          setQueryResult(null);
          setQueryQuestion('');
        }}
        title="Ask AI About This Client"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={queryQuestion}
              onChange={(e) => setQueryQuestion(e.target.value)}
              placeholder="Ask a question about this client..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleQuery();
              }}
              className="flex-1"
            />
            <Button onClick={handleQuery} disabled={isQuerying || !queryQuestion.trim()}>
              {isQuerying ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {queryResult && (
            <div className="space-y-4 mt-6">
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    AI Answer
                  </span>
                  {queryResult.knowledgeBase?.confidence && (
                    <Badge variant="secondary" size="sm">
                      {Math.round(queryResult.knowledgeBase.confidence * 100)}% confidence
                    </Badge>
                  )}
                </div>
                <p className="text-surface-700 dark:text-surface-300 whitespace-pre-wrap">
                  {queryResult.response}
                </p>
              </div>

              {queryResult.knowledgeBase?.citations && queryResult.knowledgeBase.citations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Sources from Knowledge Base
                  </h4>
                  <div className="space-y-2">
                    {queryResult.knowledgeBase.citations.map((citation: any, i: number) => (
                      <div
                        key={i}
                        className="bg-surface-50 dark:bg-surface-700/50 rounded-lg p-3 text-sm"
                      >
                        <p className="font-medium text-surface-900 dark:text-white">
                          {citation.title}
                        </p>
                        <p className="text-surface-500 mt-1 line-clamp-2">
                          {citation.excerpt}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {queryResult.suggestedActions && queryResult.suggestedActions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Suggested Actions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {queryResult.suggestedActions.map((action: any, i: number) => (
                      <Badge key={i} variant="secondary">
                        {action.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

          {/* Bulk Upload Modal */}
          <BulkUploadModal
            isOpen={showBulkUploadModal}
            onClose={() => setShowBulkUploadModal(false)}
            clientId={clientId}
            onUploadComplete={() => {
              queryClient.invalidateQueries({ queryKey: ['knowledge-base', clientId] });
              queryClient.invalidateQueries({ queryKey: ['client', clientId] });
            }}
          />
        </>
      )}
    </div>
  );
}

function BrandTab({ client }: { client: any }) {
  const brand = client.brandGuidelines;

  if (!brand) {
    return (
      <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-8 text-center">
        <Palette className="h-12 w-12 mx-auto mb-3 text-surface-300" />
        <h3 className="font-semibold text-surface-900 dark:text-white mb-2">
          No Brand Guidelines
        </h3>
        <p className="text-surface-500 mb-4">
          Brand guidelines have not been set up for this client yet.
        </p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Brand Guidelines
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Colors */}
      <Card>
        <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Colors</h3>
        <div className="space-y-4">
          {brand.primaryColors?.length > 0 && (
            <div>
              <p className="text-sm text-surface-500 mb-2">Primary</p>
              <div className="flex gap-2">
                {brand.primaryColors.map((color: string, i: number) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-lg shadow-sm border border-surface-200"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
          {brand.secondaryColors?.length > 0 && (
            <div>
              <p className="text-sm text-surface-500 mb-2">Secondary</p>
              <div className="flex gap-2">
                {brand.secondaryColors.map((color: string, i: number) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-lg shadow-sm border border-surface-200"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Typography */}
      <Card>
        <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Typography</h3>
        {brand.fonts?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {brand.fonts.map((font: string, i: number) => (
              <Badge key={i} variant="secondary">{font}</Badge>
            ))}
          </div>
        ) : (
          <p className="text-surface-400 text-sm">No fonts specified</p>
        )}
      </Card>

      {/* Voice & Tone */}
      <Card className="lg:col-span-2">
        <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Voice & Tone</h3>
        <p className="text-surface-600 dark:text-surface-400">
          {brand.voiceTone || 'Not specified'}
        </p>
      </Card>

      {/* Dos and Donts */}
      <Card>
        <h3 className="font-semibold text-green-600 mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Dos
        </h3>
        {brand.doList?.length > 0 ? (
          <ul className="space-y-2">
            {brand.doList.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-surface-600 dark:text-surface-400">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-surface-400 text-sm">No guidelines</p>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Donts
        </h3>
        {brand.dontList?.length > 0 ? (
          <ul className="space-y-2">
            {brand.dontList.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-surface-600 dark:text-surface-400">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-surface-400 text-sm">No guidelines</p>
        )}
      </Card>
    </div>
  );
}

function ClientDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton variant="text" width={100} />
      
      <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6">
        <div className="flex items-start gap-6">
          <Skeleton variant="rounded" width={80} height={80} />
          <div className="flex-1">
            <Skeleton variant="text" width="40%" height={32} className="mb-2" />
            <Skeleton variant="text" width="60%" className="mb-4" />
            <div className="flex gap-4">
              <Skeleton variant="text" width={120} />
              <Skeleton variant="text" width={100} />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-surface-200 dark:border-surface-700">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <Skeleton variant="text" width={40} height={32} className="mx-auto mb-2" />
              <Skeleton variant="text" width={80} className="mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
