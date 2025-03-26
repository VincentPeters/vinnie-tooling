'use client';

import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Note: In a real implementation, you would need to install these packages:
// npm install marked turndown

type ConversionDirection = 'markdown-to-html' | 'html-to-markdown';

export default function MarkdownConverter() {
  // Form state
  const [markdownInput, setMarkdownInput] = useState<string>('# Hello World\n\nThis is a **bold** statement and this is *italic*.\n\n## Features\n\n- Item 1\n- Item 2\n- Item 3\n\n[Visit Google](https://google.com)');
  const [htmlInput, setHtmlInput] = useState<string>('<h1>Hello World</h1>\n<p>This is a <strong>bold</strong> statement and this is <em>italic</em>.</p>\n<h2>Features</h2>\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ul>\n<p><a href="https://google.com">Visit Google</a></p>');
  const [direction, setDirection] = useState<ConversionDirection>('markdown-to-html');
  const [output, setOutput] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [markdownLibLoaded, setMarkdownLibLoaded] = useState<boolean>(false);
  const [turndownLibLoaded, setTurndownLibLoaded] = useState<boolean>(false);

  // Load the libraries dynamically (since they're client-side only)
  useEffect(() => {
    // Load the marked library for Markdown to HTML conversion
    const loadMarked = async () => {
      try {
        // In a real implementation, this would use:
        // const marked = await import('marked');
        // For now, we'll add a placeholder for the logic
        // This would be replaced by actual implementation when the package is installed
        window.marked = {
          parse: (md: string) => {
            // This is a simple placeholder for demonstration
            // The actual marked library would be much more sophisticated
            return md
              .replace(/# (.*)/g, '<h1>$1</h1>')
              .replace(/## (.*)/g, '<h2>$1</h2>')
              .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*)\*/g, '<em>$1</em>')
              .replace(/\[(.*)\]\((.*)\)/g, '<a href="$2">$1</a>')
              .replace(/- (.*)/g, '<li>$1</li>')
              .split('\n\n').map(para =>
                para.startsWith('<li>')
                  ? `<ul>${para}</ul>`
                  : para.startsWith('<h') || para.startsWith('<ul>')
                    ? para
                    : `<p>${para}</p>`
              ).join('\n');
          }
        };
        setMarkdownLibLoaded(true);
      } catch (error) {
        console.error('Failed to load marked library:', error);
      }
    };

    // Load the turndown library for HTML to Markdown conversion
    const loadTurndown = async () => {
      try {
        // In a real implementation, this would use:
        // const Turndown = await import('turndown');
        // For now, we'll add a placeholder for the logic
        window.Turndown = function () {
          return {
            turndown: (html: string) => {
              // This is a simple placeholder for demonstration
              // The actual turndown library would be much more sophisticated
              return html
                .replace(/<h1>(.*?)<\/h1>/g, '# $1')
                .replace(/<h2>(.*?)<\/h2>/g, '## $1')
                .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
                .replace(/<em>(.*?)<\/em>/g, '*$1*')
                .replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)')
                .replace(/<ul>([^]*?)<\/ul>/g, (_, list) => {
                  return list.replace(/<li>(.*?)<\/li>/g, '- $1');
                })
                .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
                .trim();
            }
          };
        };
        setTurndownLibLoaded(true);
      } catch (error) {
        console.error('Failed to load turndown library:', error);
      }
    };

    loadMarked();
    loadTurndown();
  }, []);

  // Function to convert between markdown and HTML
  useEffect(() => {
    if (!markdownLibLoaded || !turndownLibLoaded) {
      return;
    }

    try {
      if (direction === 'markdown-to-html') {
        // Convert Markdown to HTML
        const html = window.marked.parse(markdownInput);
        setOutput(html);
      } else {
        // Convert HTML to Markdown
        const turndownService = new window.Turndown();
        const markdown = turndownService.turndown(htmlInput);
        setOutput(markdown);
      }
    } catch (error: any) {
      console.error('Conversion error:', error);
      setOutput(`Error during conversion: ${error.message}`);
    }
  }, [direction, markdownInput, htmlInput, markdownLibLoaded, turndownLibLoaded]);

  // Copy to clipboard function
  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
      .then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        setCopySuccess('Failed to copy');
      });
  };

  // Function to handle input changes
  const handleInputChange = (value: string) => {
    if (direction === 'markdown-to-html') {
      setMarkdownInput(value);
    } else {
      setHtmlInput(value);
    }
  };

  // Toggle conversion direction
  const toggleDirection = () => {
    if (direction === 'markdown-to-html') {
      setDirection('html-to-markdown');
    } else {
      setDirection('markdown-to-html');
    }
  };

  // Determine the input language for syntax highlighting
  const inputLanguage = direction === 'markdown-to-html' ? 'markdown' : 'markup';
  const outputLanguage = direction === 'markdown-to-html' ? 'markup' : 'markdown';

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Markdown ↔ HTML Converter</h2>

        {/* Direction Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Conversion Direction</label>
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-md ${direction === 'markdown-to-html'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
              onClick={() => setDirection('markdown-to-html')}
            >
              Markdown → HTML
            </button>
            <button
              className={`px-4 py-2 rounded-md ${direction === 'html-to-markdown'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
              onClick={() => setDirection('html-to-markdown')}
            >
              HTML → Markdown
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">
              {direction === 'markdown-to-html' ? 'Markdown Input' : 'HTML Input'}
            </label>
          </div>
          <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            <textarea
              value={direction === 'markdown-to-html' ? markdownInput : htmlInput}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full h-64 p-4 font-mono text-sm dark:bg-gray-700 focus:outline-none"
              placeholder={direction === 'markdown-to-html' ? "Enter markdown here..." : "Enter HTML here..."}
            />
          </div>
        </div>

        {/* Swap button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={toggleDirection}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-md inline-flex items-center"
          >
            <span>Swap Direction</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {direction === 'markdown-to-html' ? 'HTML Output' : 'Markdown Output'}
          </h3>
          <button
            onClick={copyToClipboard}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md inline-flex items-center"
          >
            {copySuccess ? copySuccess : 'Copy to Clipboard'}
          </button>
        </div>
        <div className="relative overflow-hidden rounded-md">
          <SyntaxHighlighter
            language={outputLanguage}
            style={vscDarkPlus}
            customStyle={{ margin: 0, padding: '16px', borderRadius: '6px' }}
            wrapLongLines={true}
          >
            {output}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* Preview Section (for HTML output) */}
      {direction === 'markdown-to-html' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">HTML Preview</h3>
          <div
            className="p-4 border border-gray-300 dark:border-gray-600 rounded-md max-h-96 overflow-auto"
            dangerouslySetInnerHTML={{ __html: output }}
          />
        </div>
      )}
    </div>
  );
}

// Type declaration for window
declare global {
  interface Window {
    marked: {
      parse: (markdown: string) => string;
    };
    Turndown: any;
  }
}