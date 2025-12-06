'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsService, ClientFilters } from '@/services/clients.service';
import { IClient, CreateClientDto } from '@/types';
import toast from 'react-hot-toast';

export function useClients(filters: ClientFilters = {}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['clients', filters],
    queryFn: () => clientsService.getClients(filters),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateClientDto) => clientsService.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client created');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create client');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IClient> }) =>
      clientsService.updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update client');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientsService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client archived');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete client');
    },
  });

  return {
    clients: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    createClient: createMutation.mutateAsync,
    updateClient: (id: string, data: Partial<IClient>) =>
      updateMutation.mutateAsync({ id, data }),
    deleteClient: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}

export function useClient(clientId: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientsService.getClient(clientId),
    enabled: !!clientId,
  });

  const addContactMutation = useMutation({
    mutationFn: (contact: any) => clientsService.addContact(clientId, contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      toast.success('Contact added');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add contact');
    },
  });

  const removeContactMutation = useMutation({
    mutationFn: (contactIndex: number) => clientsService.removeContact(clientId, contactIndex),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      toast.success('Contact removed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove contact');
    },
  });

  return {
    client: data,
    isLoading,
    error,
    addContact: addContactMutation.mutateAsync,
    removeContact: removeContactMutation.mutateAsync,
    isAddingContact: addContactMutation.isPending,
  };
}


