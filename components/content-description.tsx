import { sanitizeHTML } from '@/lib/transformers';

interface ContentDescriptionProps {
  html: string;
}

/**
 * Parses basic Markdown into HTML
 */
function parseMarkdown(text: string): string {
  if (!text) return '';
  // Check if it's already HTML
  if (text.trim().startsWith('<') || text.includes('</div>') || text.includes('</p>')) {
    return text;
  }

  let parsed = text
    .replace(/(?:^|\n)###\s+([^\n]+)/g, '<h3>$1</h3>')
    .replace(/(?:^|\n)##\s+([^\n]+)/g, '<h2>$1</h2>')
    .replace(/(?:^|\n)#\s+([^\n]+)/g, '<h1>$1</h1>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300">$1</a>')
    .replace(/(?:^|\n)\s*[\-\*]\s+([^\n]+)/g, '\n<ul><li>$1</li></ul>')
    .replace(/\n\n/g, '<br /><br />')
    .replace(/\n/g, '<br />');

  return parsed.replace(/<\/ul><br \/>\s*<ul>/g, '').replace(/<\/ul>\s*<ul>/g, '');
}

/**
 * ContentDescription component
 * Displays sanitized HTML content with dark theme styling
 */
export function ContentDescription({ html }: ContentDescriptionProps) {
  const parsedHtml = parseMarkdown(html);
  const sanitizedHTML = sanitizeHTML(parsedHtml);
  
  return (
    <div 
      className="prose prose-invert prose-sm max-w-none prose-a:text-emerald-400 hover:prose-a:text-emerald-300 prose-headings:text-white prose-strong:text-white leading-relaxed text-zinc-300"
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
}
