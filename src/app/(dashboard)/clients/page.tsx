'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClients } from '@/hooks/useClients';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Search,
  Building2,
  Globe,
  Mail,
  Phone,
  Users,
  FileText,
  ExternalLink,
} from 'lucide-react';

const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  primaryContactName: z.string().min(1, 'Contact name is required'),
  primaryContactEmail: z.string().email('Valid email required'),
  primaryContactPhone: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  description: z.string().optional(),
});

type CreateClientForm = z.infer<typeof createClientSchema>;

export default function ClientsPage() {
  const { clients, isLoading, createClient, isCreating } = useClients();
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClientForm>({
    resolver: zodResolver(createClientSchema),
  });

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase())
  );

  const onSubmit = async (data: CreateClientForm) => {
    try {
      await createClient({
        name: data.name,
        primaryContact: {
          name: data.primaryContactName,
          email: data.primaryContactEmail,
          phone: data.primaryContactPhone,
        },
        website: data.website,
        industry: data.industry,
        description: data.description,
      });
      setCreateModalOpen(false);
      reset();
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Manage your client accounts and their projects"
        action={
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Clients Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton variant="circular" width={48} height={48} />
                  <div className="flex-1">
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" className="mt-1" />
                  </div>
                </div>
                <Skeleton variant="rounded" height={60} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-surface-800 rounded-xl">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-surface-400" />
          <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">
            No clients found
          </h3>
          <p className="text-surface-500 dark:text-surface-400 mb-4">
            {search ? 'Try adjusting your search' : 'Get started by adding your first client'}
          </p>
          {!search && (
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Link key={client._id} href={`/clients/${client._id}`}>
              <Card hover className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar
                      firstName={client.name}
                      lastName=""
                      src={client.logo}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-surface-900 dark:text-white truncate">
                        {client.name}
                      </h3>
                      {client.industry && (
                        <p className="text-sm text-surface-500 dark:text-surface-400">
                          {client.industry}
                        </p>
                      )}
                      <Badge
                        variant={client.isActive ? 'success' : 'secondary'}
                        size="sm"
                        className="mt-1"
                      >
                        {client.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-surface-200 dark:border-surface-700">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-surface-900 dark:text-white">
                        {client.contacts?.length || 0}
                      </p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">
                        Contacts
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-surface-900 dark:text-white">
                        {client.knowledgeBase?.documentCount || 0}
                      </p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">
                        Docs
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-surface-900 dark:text-white">
                        {client.services?.length || 0}
                      </p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">
                        Services
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 pt-4 border-t border-surface-200 dark:border-surface-700">
                    <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{client.primaryContact?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{client.primaryContact?.email}</span>
                    </div>
                    {client.website && (
                      <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
                        <Globe className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{client.website}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Create Client Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          reset();
        }}
        title="Add New Client"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            {...register('name')}
            label="Client Name"
            placeholder="Acme Corporation"
            error={errors.name?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register('industry')}
              label="Industry"
              placeholder="Technology"
            />
            <Input
              {...register('website')}
              label="Website"
              placeholder="https://example.com"
            />
          </div>

          <div className="border-t border-surface-200 dark:border-surface-700 pt-6">
            <h4 className="font-medium text-surface-900 dark:text-white mb-4">
              Primary Contact
            </h4>
            <div className="space-y-4">
              <Input
                {...register('primaryContactName')}
                label="Contact Name"
                placeholder="John Smith"
                error={errors.primaryContactName?.message}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  {...register('primaryContactEmail')}
                  type="email"
                  label="Email"
                  placeholder="john@example.com"
                  error={errors.primaryContactEmail?.message}
                />
                <Input
                  {...register('primaryContactPhone')}
                  label="Phone"
                  placeholder="+1 555 123 4567"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreateModalOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Create Client
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}





