'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { MessageSquare, Activity, Ticket, FileText } from 'lucide-react';

const supportTools = [
  {
    name: 'AI Conversations',
    description: 'Browse and view AI conversation history',
    href: '/admin/support/conversations',
    icon: MessageSquare,
    color: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600',
  },
  {
    name: 'Activity Logs',
    description: 'View user activity across the platform',
    href: '/admin/support/activity',
    icon: Activity,
    color: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600',
  },
  {
    name: 'Tickets Browser',
    description: 'Browse all tickets across organizations',
    href: '/admin/support/tickets',
    icon: Ticket,
    color: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600',
  },
  {
    name: 'Audit Logs',
    description: 'View admin actions and system changes',
    href: '/admin/support/audit-logs',
    icon: FileText,
    color: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600',
  },
];

export default function SupportPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
          Support Tools
        </h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">
          Tools for customer support and platform monitoring
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {supportTools.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <Card hover className="h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${tool.color}`}>
                    <tool.icon className={`w-6 h-6 ${tool.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                      {tool.name}
                    </h3>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
