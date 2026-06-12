import React from 'react';

/**
 * A robust line-by-line custom markdown parser that converts markdown string content
 * into styled React components using React.createElement instead of JSX.
 * This ensures it compiles perfectly as a standard .ts file under any build configuration.
 */
export const parseMarkdown = (text: string): React.ReactNode[] => {
  if (!text) return [];

  const lines = text.split('\n');
  const result: React.ReactNode[] = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Handle Code Blocks
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      const codeText = codeLines.join('\n').trim();
      const currentIdx = i;
      
      const handleCopy = () => {
        if (typeof window !== 'undefined') {
          navigator.clipboard.writeText(codeText);
        }
      };

      result.push(
        React.createElement(
          'pre',
          { key: `code-${currentIdx}`, className: 'markdown-code-block' },
          React.createElement(
            'div',
            { className: 'code-header' },
            React.createElement('span', null, 'DACC CONTRACT TERMINAL'),
            React.createElement(
              'button',
              { type: 'button', onClick: handleCopy, className: 'copy-code-btn' },
              'COPY'
            )
          ),
          React.createElement('code', null, codeText)
        )
      );
      i++; // Skip closing ```
      continue;
    }

    // Handle Headings
    if (trimmed.startsWith('### ')) {
      result.push(
        React.createElement(
          'h4',
          { key: `h4-${i}`, className: 'markdown-h4' },
          React.createElement('span', { className: 'h-dot' }),
          parseInline(trimmed.substring(4))
        )
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      result.push(
        React.createElement(
          'h3',
          { key: `h3-${i}`, className: 'markdown-h3' },
          React.createElement('span', { className: 'h-dot' }),
          parseInline(trimmed.substring(3))
        )
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      result.push(
        React.createElement(
          'h2',
          { key: `h2-${i}`, className: 'markdown-h2' },
          parseInline(trimmed.substring(2))
        )
      );
      i++;
      continue;
    }

    // Handle Bullet Lists (group consecutive lines starting with - or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        const itemText = lines[i].trim().replace(/^[-*]\s+/, '');
        listItems.push(itemText);
        i++;
      }
      result.push(
        React.createElement(
          'ul',
          { key: `ul-${i}`, className: 'markdown-list' },
          listItems.map((item, idx) =>
            React.createElement(
              'li',
              { key: idx },
              React.createElement('span', { className: 'list-bullet' }, '[//]'),
              React.createElement('span', null, parseInline(item))
            )
          )
        )
      );
      continue;
    }

    // Handle normal paragraphs (group consecutive normal text lines)
    const paragraphLines: string[] = [];
    while (i < lines.length) {
      const curTrimmed = lines[i].trim();
      if (!curTrimmed) break;
      if (curTrimmed.startsWith('```') || curTrimmed.startsWith('#') || curTrimmed.startsWith('- ') || curTrimmed.startsWith('* ')) {
        break;
      }
      paragraphLines.push(lines[i].trim());
      i++;
    }
    if (paragraphLines.length > 0) {
      result.push(
        React.createElement(
          'p',
          { key: `p-${i}`, className: 'markdown-p' },
          parseInline(paragraphLines.join(' '))
        )
      );
    }
  }

  return result;
};

// Parse inline styles (Bold, Links, Inline Code)
const parseInline = (text: string): React.ReactNode => {
  const currentText = text;

  // Inline regex elements: Bold (**), Links ( [text](url) ), Inline Code (`)
  const inlineRegex = /(\*\*.*?\*\*|\[.*?\]\(.*?\)|`.*?`)/g;
  const splitParts = currentText.split(inlineRegex);

  if (splitParts.length === 1) {
    return text;
  }

  return splitParts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return React.createElement('strong', { key: idx }, part.slice(2, -2));
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return React.createElement(
        'code',
        { key: idx, className: 'markdown-inline-code' },
        part.slice(1, -1)
      );
    }
    if (part.startsWith('[') && part.includes('](')) {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return React.createElement(
          'a',
          {
            key: idx,
            href: match[2],
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'markdown-link',
          },
          match[1]
        );
      }
    }
    return part;
  });
};
