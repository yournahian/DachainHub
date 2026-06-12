import React from 'react';

/**
 * A robust line-by-line custom markdown parser that converts markdown string content
 * into styled React components. It correctly handles headings, fenced code blocks,
 * lists, and paragraphs even when separated by a single newline.
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
        <pre key={`code-${currentIdx}`} className="markdown-code-block">
          <div className="code-header">
            <span>DACC CONTRACT TERMINAL</span>
            <button type="button" onClick={handleCopy} className="copy-code-btn">
              COPY
            </button>
          </div>
          <code>{codeText}</code>
        </pre>
      );
      i++; // Skip closing ```
      continue;
    }

    // Handle Headings
    if (trimmed.startsWith('### ')) {
      result.push(
        <h4 key={`h4-${i}`} className="markdown-h4">
          <span className="h-dot" />
          {parseInline(trimmed.substring(4))}
        </h4>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      result.push(
        <h3 key={`h3-${i}`} className="markdown-h3">
          <span className="h-dot" />
          {parseInline(trimmed.substring(3))}
        </h3>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      result.push(
        <h2 key={`h2-${i}`} className="markdown-h2">
          {parseInline(trimmed.substring(2))}
        </h2>
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
        <ul key={`ul-${i}`} className="markdown-list">
          {listItems.map((item, idx) => (
            <li key={idx}>
              <span className="list-bullet">[//]</span>
              <span>{parseInline(item)}</span>
            </li>
          ))}
        </ul>
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
        <p key={`p-${i}`} className="markdown-p">
          {parseInline(paragraphLines.join(' '))}
        </p>
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
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={idx} className="markdown-inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('[') && part.includes('](')) {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <a
            key={idx}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="markdown-link"
          >
            {match[1]}
          </a>
        );
      }
    }
    return part;
  });
};
