'use client';

import { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { API_URL } from '@/lib/constants';

interface EmbedCodeDisplayProps {
  chatWidgetId: string;
}

/**
 * Displays the embed code snippet for the chat widget
 * Users copy this to their website before </body>
 */
export function EmbedCodeDisplay({ chatWidgetId }: EmbedCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  // Construct the API URL for the widget script
  // Remove /api/v1 suffix if present to get the base URL
  const baseUrl = API_URL.replace(/\/api\/v1$/, '');
  
  const embedCode = `<script 
  src="${baseUrl}/chat-widget.js" 
  data-chat-widget-id="${chatWidgetId}" 
  async></script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Code className="h-5 w-5 text-primary-500" />
        <h4 className="font-semibold text-surface-900 dark:text-white">
          Embed Code
        </h4>
      </div>
      
      <p className="text-sm text-surface-500 mb-3">
        Add this code to your website, just before the closing <code className="bg-surface-100 dark:bg-surface-700 px-1 rounded">&lt;/body&gt;</code> tag:
      </p>
      
      <div className="relative">
        <pre className="bg-surface-900 dark:bg-surface-950 text-surface-100 p-4 rounded-lg text-sm overflow-x-auto font-mono">
          {embedCode}
        </pre>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="absolute top-2 right-2 bg-surface-800 hover:bg-surface-700 border-surface-600"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      
      <p className="text-xs text-surface-400 mt-3">
        The widget will appear automatically on pages where this code is added.
      </p>
    </Card>
  );
}
