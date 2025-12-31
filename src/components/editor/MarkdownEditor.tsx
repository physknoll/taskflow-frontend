'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import { useEffect, useCallback } from 'react';
import TurndownService from 'turndown';

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

// Custom rules for better markdown output
turndownService.addRule('strikethrough', {
  filter: ['del', 's'] as (keyof HTMLElementTagNameMap)[],
  replacement: (content) => `~~${content}~~`,
});

export interface MarkdownEditorProps {
  initialContent: string;
  onChange?: (markdown: string) => void;
  onEditorReady?: (editor: Editor) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

/**
 * Convert markdown to HTML for TipTap
 * Simple parser for common markdown syntax
 */
function markdownToHtml(markdown: string): string {
  if (!markdown) return '<p></p>';
  
  let html = markdown
    // Escape HTML entities first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks (must be before other processing)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headings
    .replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
    .replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
    .replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
    .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
    .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
    .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/___(.+?)___/g, '<strong><em>$1</em></strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<s>$1</s>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr>')
    .replace(/^\*\*\*$/gm, '<hr>')
    // Blockquotes
    .replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
    // Unordered lists
    .replace(/^[-*+]\s+(.+)$/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    // Paragraphs (wrap remaining lines)
    .split('\n\n')
    .map((block) => {
      block = block.trim();
      if (!block) return '';
      // Don't wrap if already has block-level tags
      if (
        block.startsWith('<h') ||
        block.startsWith('<p') ||
        block.startsWith('<ul') ||
        block.startsWith('<ol') ||
        block.startsWith('<li') ||
        block.startsWith('<blockquote') ||
        block.startsWith('<pre') ||
        block.startsWith('<hr')
      ) {
        return block;
      }
      // Wrap list items in ul
      if (block.includes('<li>')) {
        return `<ul>${block}</ul>`;
      }
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('');

  return html || '<p></p>';
}

/**
 * Convert TipTap HTML output to Markdown
 */
function htmlToMarkdown(html: string): string {
  if (!html || html === '<p></p>') return '';
  return turndownService.turndown(html);
}

export function MarkdownEditor({
  initialContent,
  onChange,
  onEditorReady,
  placeholder = 'Start writing...',
  editable = true,
  className = '',
}: MarkdownEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-surface-100 dark:bg-surface-900 rounded-lg p-4 font-mono text-sm overflow-x-auto',
          },
        },
        code: {
          HTMLAttributes: {
            class: 'bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded text-sm font-mono',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-primary-500 pl-4 italic text-surface-600 dark:text-surface-400',
          },
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 dark:text-primary-400 underline hover:no-underline',
        },
      }),
    ],
    content: markdownToHtml(initialContent),
    editable,
    editorProps: {
      attributes: {
        class: `prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] ${className}`,
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        const html = editor.getHTML();
        const markdown = htmlToMarkdown(html);
        onChange(markdown);
      }
    },
  });

  // Notify when editor is ready
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Update content when initialContent changes externally
  useEffect(() => {
    if (editor && initialContent !== undefined) {
      const currentMarkdown = htmlToMarkdown(editor.getHTML());
      if (currentMarkdown !== initialContent) {
        editor.commands.setContent(markdownToHtml(initialContent));
      }
    }
  }, [editor, initialContent]);

  if (!editor) {
    return (
      <div className="animate-pulse bg-surface-100 dark:bg-surface-800 rounded-lg h-[300px]" />
    );
  }

  return (
    <EditorContent
      editor={editor}
      className="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-4 overflow-y-auto"
    />
  );
}

// Export utilities for external use
export { markdownToHtml, htmlToMarkdown };

// Export editor type for toolbar integration
export type { Editor };
