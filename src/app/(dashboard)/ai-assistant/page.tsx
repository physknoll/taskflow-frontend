'use client';

import { useState, useRef, useEffect } from 'react';
import { useAI } from '@/hooks/useAI';
import { useClients } from '@/hooks/useClients';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Sparkles,
  Loader2,
  Bot,
  User,
  RefreshCw,
  Copy,
  Check,
  MessageSquare,
  FileText,
  Mail,
  Ticket,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: any[];
  suggestedActions?: any[];
  timestamp: Date;
}

type ChatMode = 'general' | 'knowledge_base' | 'daily_update';

export default function AIAssistantPage() {
  const { user } = useAuthStore();
  const { clients } = useClients();
  const { sendMessage, parseUpdate, isLoading, isParsing } = useAI();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ChatMode>('general');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with greeting
  useEffect(() => {
    const greetings: Record<ChatMode, string> = {
      general: `Hi ${user?.firstName || 'there'}! I'm your AI assistant. I can help you with:\n\n• Creating detailed tickets with AI-generated tasks\n• Answering questions about your projects\n• Composing professional emails\n• Logging your daily work updates\n\nHow can I help you today?`,
      knowledge_base: "Hello! I have access to your client's knowledge base. Ask me anything about their products, services, brand guidelines, or any documented information.",
      daily_update: "Hey! Ready to log your daily update? Just tell me what you worked on today, and I'll help organize it into ticket updates. For example:\n\n\"I finished the homepage design for Acme, worked on the blog post for TechCo for about 2 hours, and got blocked on the API integration waiting for credentials.\"",
    };

    setMessages([{
      id: '1',
      role: 'assistant',
      content: greetings[mode],
      timestamp: new Date(),
    }]);
  }, [mode, user?.firstName]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Require client selection for knowledge base mode
    if (mode === 'knowledge_base' && !selectedClient) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Please select a client from the sidebar to search their knowledge base.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');

    try {
      if (mode === 'daily_update') {
        const response = await parseUpdate(currentInput);
        
        let assistantContent = response.aiResponse;
        if (response.parsedUpdates.length > 0) {
          assistantContent += '\n\n**Parsed Updates:**\n';
          response.parsedUpdates.forEach((update, i) => {
            assistantContent += `\n${i + 1}. **${update.ticketNumber}** - ${update.ticketTitle}\n`;
            assistantContent += `   - Type: ${update.updateType}\n`;
            assistantContent += `   - ${update.description}\n`;
            if (update.timeSpent) {
              assistantContent += `   - Time spent: ${update.timeSpent} minutes\n`;
            }
          });
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // For knowledge_base mode, use the knowledge-chat endpoint
        const response = await sendMessage({
          message: currentInput,
          clientId: selectedClient || undefined,
          mode,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
        });

        // Build response content
        let responseContent = response.response;
        
        // Add knowledge base info if available
        const kb = (response as any).knowledgeBase;
        if (kb?.citations && kb.citations.length > 0) {
          responseContent += '\n\n---\n**Sources:**';
          kb.citations.forEach((citation: any) => {
            responseContent += `\n- *${citation.title}*`;
            if (citation.excerpt) {
              responseContent += `: "${citation.excerpt.substring(0, 100)}..."`;
            }
          });
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseContent,
          citations: response.citations || (response as any).knowledgeBase?.citations,
          suggestedActions: response.suggestedActions,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error: any) {
      console.error('AI Assistant error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm sorry, I encountered an error: ${error.response?.data?.message || error.message || 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <PageHeader
        title="AI Assistant"
        description="Your intelligent project management companion"
      />

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 space-y-4">
          {/* Mode Selection */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium text-surface-900 dark:text-white">Mode</h3>
              <div className="space-y-2">
                {[
                  { id: 'general', label: 'General Chat', icon: MessageSquare },
                  { id: 'knowledge_base', label: 'Knowledge Base', icon: FileText },
                  { id: 'daily_update', label: 'Daily Update', icon: Ticket },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setMode(id as ChatMode)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors',
                      mode === id
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                        : 'hover:bg-surface-100 text-surface-600 dark:hover:bg-surface-800 dark:text-surface-400'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Client Selection (for knowledge base mode) */}
          {mode === 'knowledge_base' && (
            <Card className={!selectedClient ? 'border-amber-300 dark:border-amber-600' : ''}>
              <CardContent className="p-4">
                <Select
                  label="Client Context"
                  options={[
                    { value: '', label: 'Select a client...' },
                    ...clients.map((c) => ({ value: c._id, label: c.name })),
                  ]}
                  value={selectedClient}
                  onChange={setSelectedClient}
                />
                {!selectedClient && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    ⚠️ Select a client to search their knowledge base
                  </p>
                )}
                {selectedClient && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    ✓ Searching {clients.find(c => c._id === selectedClient)?.name}'s knowledge base
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-surface-900 dark:text-white mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={clearChat}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-4 max-w-4xl',
                  message.role === 'user' && 'ml-auto flex-row-reverse'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  message.role === 'assistant'
                    ? 'bg-gradient-to-br from-primary-500 to-accent-500'
                    : 'bg-surface-200 dark:bg-surface-700'
                )}>
                  {message.role === 'assistant' ? (
                    <Bot className="h-5 w-5 text-white" />
                  ) : (
                    <User className="h-5 w-5 text-surface-600 dark:text-surface-300" />
                  )}
                </div>
                <div className={cn(
                  'flex-1 max-w-[80%]',
                  message.role === 'user' && 'text-right'
                )}>
                  <div className={cn(
                    'inline-block rounded-2xl px-4 py-3 text-sm',
                    message.role === 'assistant'
                      ? 'ai-message text-left'
                      : 'user-message'
                  )}>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-surface-400 dark:text-surface-500">
                    <span>{formatRelativeTime(message.timestamp)}</span>
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => copyToClipboard(message.content, message.id)}
                        className="hover:text-surface-600 dark:hover:text-surface-300"
                      >
                        {copiedId === message.id ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {(isLoading || isParsing) && (
              <div className="flex gap-4 max-w-4xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="flex items-center gap-2 text-surface-500 dark:text-surface-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-surface-200 dark:border-surface-700">
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  mode === 'daily_update'
                    ? "Tell me what you worked on today..."
                    : mode === 'knowledge_base'
                    ? "Ask about your client's information..."
                    : "Ask me anything..."
                }
                rows={1}
                className="flex-1 resize-none rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 px-4 py-3 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                style={{ maxHeight: '150px' }}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || isParsing}
                size="lg"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-surface-400 dark:text-surface-500 mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

