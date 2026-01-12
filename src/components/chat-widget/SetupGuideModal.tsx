'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  BookOpen,
  Check,
  Copy,
  ChevronRight,
  ExternalLink,
  FileCode,
  Globe,
  Key,
  Lightbulb,
  MessageSquare,
  Settings,
  Shield,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_URL } from '@/lib/constants';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatWidgetId?: string;
  apiKeyPrefix?: string;
}

const STEPS = [
  {
    id: 1,
    title: 'Configure Your Widget',
    icon: Settings,
    description: 'Set up your widget appearance and behavior',
  },
  {
    id: 2,
    title: 'Add Knowledge Base Content',
    icon: BookOpen,
    description: 'Upload documents for AI-powered responses',
  },
  {
    id: 3,
    title: 'Copy the Embed Code',
    icon: FileCode,
    description: 'Get the code snippet for your website',
  },
  {
    id: 4,
    title: 'Add to Your Website',
    icon: Globe,
    description: 'Paste the code before </body>',
  },
  {
    id: 5,
    title: 'Test & Launch',
    icon: Zap,
    description: 'Verify everything works correctly',
  },
];

/**
 * Comprehensive setup guide modal with step-by-step instructions
 * for installing the chat widget on a website
 */
export function SetupGuideModal({
  isOpen,
  onClose,
  chatWidgetId,
  apiKeyPrefix,
}: SetupGuideModalProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const baseUrl = API_URL.replace(/\/api\/v1$/, '');
  
  const embedCode = chatWidgetId
    ? `<script 
  src="${baseUrl}/chat-widget.js" 
  data-chat-widget-id="${chatWidgetId}" 
  async></script>`
    : `<script 
  src="${baseUrl}/chat-widget.js" 
  data-chat-widget-id="YOUR_WIDGET_ID" 
  async></script>`;

  const handleCopy = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chat Widget Setup Guide"
      size="xl"
    >
      <div className="flex gap-6">
        {/* Step Navigation */}
        <div className="w-56 flex-shrink-0 border-r border-surface-200 dark:border-surface-700 pr-6">
          <nav className="space-y-1">
            {STEPS.map((step) => {
              const isActive = activeStep === step.id;
              const isCompleted = activeStep > step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={cn(
                    'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors',
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'hover:bg-surface-100 dark:hover:bg-surface-800'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium',
                      isActive
                        ? 'bg-primary-500 text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400'
                    )}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        'font-medium text-sm',
                        isActive
                          ? 'text-primary-700 dark:text-primary-300'
                          : 'text-surface-900 dark:text-white'
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">
                      {step.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Step Content */}
        <div className="flex-1 min-w-0">
          {activeStep === 1 && (
            <StepContent
              title="Configure Your Widget"
              icon={Settings}
            >
              <p className="text-surface-600 dark:text-surface-400 mb-4">
                Start by customizing how your chat widget looks and behaves:
              </p>
              
              <div className="space-y-4">
                <GuideItem title="Enable the Widget">
                  Toggle the &quot;Enable Chat Widget&quot; switch at the top of the configuration form.
                </GuideItem>
                
                <GuideItem title="Customize Appearance">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Bot Name:</strong> The name shown in the chat header (e.g., &quot;Support Assistant&quot;)</li>
                    <li><strong>Greeting Message:</strong> The first message visitors see when opening the chat</li>
                    <li><strong>Primary Color:</strong> Match your brand colors using the color picker</li>
                    <li><strong>Position:</strong> Choose bottom-right or bottom-left placement</li>
                  </ul>
                </GuideItem>
                
                <GuideItem title="Set Security Options">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Allowed Domains:</strong> Restrict where the widget can be used (recommended for production)</li>
                    <li>Use wildcards like <code className="bg-surface-100 dark:bg-surface-700 px-1 rounded">*.example.com</code> for subdomains</li>
                  </ul>
                </GuideItem>

                <TipBox>
                  Leave &quot;Allowed Domains&quot; empty during development to test on localhost.
                </TipBox>
              </div>
            </StepContent>
          )}

          {activeStep === 2 && (
            <StepContent
              title="Add Knowledge Base Content"
              icon={BookOpen}
            >
              <p className="text-surface-600 dark:text-surface-400 mb-4">
                The chat widget uses your client&apos;s knowledge base to provide accurate, context-aware responses:
              </p>
              
              <div className="space-y-4">
                <GuideItem title="Upload Documents">
                  Go to the <strong>Documents</strong> tab and add content the AI can reference:
                  <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                    <li>Product documentation and FAQs</li>
                    <li>Pricing information</li>
                    <li>Company policies and procedures</li>
                    <li>Service descriptions</li>
                  </ul>
                </GuideItem>
                
                <GuideItem title="Organize by Category">
                  Use categories to organize content. You can then filter which categories
                  the widget has access to in the configuration.
                </GuideItem>
                
                <GuideItem title="Filter Categories (Optional)">
                  In the widget config, select specific categories to limit what knowledge
                  the AI can access. Leave empty to use all categories.
                </GuideItem>

                <TipBox>
                  The more relevant content you add, the better the AI responses will be.
                  Focus on common customer questions first.
                </TipBox>
              </div>
            </StepContent>
          )}

          {activeStep === 3 && (
            <StepContent
              title="Copy the Embed Code"
              icon={FileCode}
            >
              <p className="text-surface-600 dark:text-surface-400 mb-4">
                After saving your configuration, you&apos;ll get a unique embed code:
              </p>
              
              <div className="space-y-4">
                <GuideItem title="Your Embed Code">
                  <div className="relative mt-2">
                    <pre className="bg-surface-900 text-surface-100 p-4 rounded-lg text-sm overflow-x-auto font-mono">
                      {embedCode}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(embedCode, 'embed')}
                      className="absolute top-2 right-2 bg-surface-800 hover:bg-surface-700 border-surface-600"
                    >
                      {copiedCode === 'embed' ? (
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
                </GuideItem>

                <GuideItem title="Understanding the Code">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><code className="bg-surface-100 dark:bg-surface-700 px-1 rounded">src</code> - The widget script URL</li>
                    <li><code className="bg-surface-100 dark:bg-surface-700 px-1 rounded">data-chat-widget-id</code> - Your unique widget identifier</li>
                    <li><code className="bg-surface-100 dark:bg-surface-700 px-1 rounded">async</code> - Loads without blocking page render</li>
                  </ul>
                </GuideItem>

                {apiKeyPrefix && (
                  <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <Key className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800 dark:text-amber-200">
                        API Key: {apiKeyPrefix}
                      </p>
                      <p className="text-amber-700 dark:text-amber-300 mt-1">
                        The API key is embedded in the widget ID and handled automatically.
                        Keep your widget ID secure.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </StepContent>
          )}

          {activeStep === 4 && (
            <StepContent
              title="Add to Your Website"
              icon={Globe}
            >
              <p className="text-surface-600 dark:text-surface-400 mb-4">
                Add the embed code to your website. Here are instructions for common platforms:
              </p>
              
              <div className="space-y-4">
                <GuideItem title="HTML Websites">
                  Paste the code just before the closing <code className="bg-surface-100 dark:bg-surface-700 px-1 rounded">&lt;/body&gt;</code> tag:
                  <div className="relative mt-2">
                    <pre className="bg-surface-900 text-surface-100 p-4 rounded-lg text-sm overflow-x-auto font-mono">
{`<!DOCTYPE html>
<html>
<head>
  <title>Your Website</title>
</head>
<body>
  <!-- Your website content -->
  
  <!-- Chat Widget - Add before </body> -->
  ${embedCode}
</body>
</html>`}
                    </pre>
                  </div>
                </GuideItem>
                
                <GuideItem title="WordPress">
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Go to <strong>Appearance → Theme Editor</strong></li>
                    <li>Select your theme&apos;s <code className="bg-surface-100 dark:bg-surface-700 px-1 rounded">footer.php</code> file</li>
                    <li>Paste the code before <code className="bg-surface-100 dark:bg-surface-700 px-1 rounded">&lt;/body&gt;</code></li>
                    <li>Or use a plugin like &quot;Insert Headers and Footers&quot;</li>
                  </ol>
                </GuideItem>

                <GuideItem title="Shopify">
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Go to <strong>Online Store → Themes</strong></li>
                    <li>Click <strong>Actions → Edit code</strong></li>
                    <li>Find <code className="bg-surface-100 dark:bg-surface-700 px-1 rounded">theme.liquid</code></li>
                    <li>Paste the code before <code className="bg-surface-100 dark:bg-surface-700 px-1 rounded">&lt;/body&gt;</code></li>
                  </ol>
                </GuideItem>

                <GuideItem title="React / Next.js">
                  Add to your root layout or use next/script:
                  <div className="relative mt-2">
                    <pre className="bg-surface-900 text-surface-100 p-4 rounded-lg text-sm overflow-x-auto font-mono">
{`import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src="${baseUrl}/chat-widget.js"
          data-chat-widget-id="${chatWidgetId || 'YOUR_WIDGET_ID'}"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}`}
                    </pre>
                  </div>
                </GuideItem>

                <TipBox>
                  The widget loads asynchronously and won&apos;t affect your page load speed.
                </TipBox>
              </div>
            </StepContent>
          )}

          {activeStep === 5 && (
            <StepContent
              title="Test & Launch"
              icon={Zap}
            >
              <p className="text-surface-600 dark:text-surface-400 mb-4">
                Before going live, test your widget thoroughly:
              </p>
              
              <div className="space-y-4">
                <GuideItem title="Testing Checklist">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Widget button appears in the correct position</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Clicking the button opens the chat panel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Greeting message displays correctly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>AI responds to test questions accurately</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Widget works on mobile devices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Sessions appear in the Analytics section</span>
                    </li>
                  </ul>
                </GuideItem>

                <GuideItem title="Local Testing">
                  Create a test HTML file to verify the widget works:
                  <div className="relative mt-2">
                    <pre className="bg-surface-900 text-surface-100 p-4 rounded-lg text-sm overflow-x-auto font-mono">
{`<!DOCTYPE html>
<html>
<head>
  <title>Widget Test</title>
</head>
<body>
  <h1>Chat Widget Test Page</h1>
  <p>The widget should appear in the corner.</p>
  
  ${embedCode}
</body>
</html>`}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(`<!DOCTYPE html>
<html>
<head>
  <title>Widget Test</title>
</head>
<body>
  <h1>Chat Widget Test Page</h1>
  <p>The widget should appear in the corner.</p>
  
  ${embedCode}
</body>
</html>`, 'test')}
                      className="absolute top-2 right-2 bg-surface-800 hover:bg-surface-700 border-surface-600"
                    >
                      {copiedCode === 'test' ? (
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
                </GuideItem>

                <GuideItem title="Troubleshooting">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Widget not appearing?</strong> Check browser console for errors</li>
                    <li><strong>Domain blocked?</strong> Add your domain to Allowed Domains</li>
                    <li><strong>AI not responding?</strong> Ensure knowledge base has content</li>
                    <li><strong>Wrong colors?</strong> Clear browser cache and reload</li>
                  </ul>
                </GuideItem>

                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      You&apos;re all set!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Once installed, visitor conversations will appear in the Analytics
                      section. You can review sessions, see which knowledge base articles
                      were cited, and monitor response quality.
                    </p>
                  </div>
                </div>
              </div>
            </StepContent>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6 pt-6 border-t border-surface-200 dark:border-surface-700">
            <Button
              variant="outline"
              onClick={() => setActiveStep((s) => Math.max(1, s - 1))}
              disabled={activeStep === 1}
            >
              Previous
            </Button>
            {activeStep < 5 ? (
              <Button onClick={() => setActiveStep((s) => s + 1)}>
                Next Step
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={onClose}>
                Done
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function StepContent({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
          <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function GuideItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-50 dark:bg-surface-800/50 rounded-lg p-4">
      <h4 className="font-medium text-surface-900 dark:text-white mb-2">
        {title}
      </h4>
      <div className="text-sm text-surface-600 dark:text-surface-400">
        {children}
      </div>
    </div>
  );
}

function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
      <Lightbulb className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-primary-700 dark:text-primary-300">{children}</p>
    </div>
  );
}
