'use client';

import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Note: In a real implementation, you would need to install these packages:
// npm install marked turndown

export default function MarkdownConverter() {
  // Form state
  const [markdownInput, setMarkdownInput] = useState<string>('# Sample Markdown\n\nThis is some basic, sample markdown.\n\n## Second Heading\n\n* Unordered lists, and:\n  1. One\n  2. Two\n  3. Three\n* More\n\n> Blockquote\n\nAnd **bold**, *italics*, and even *italics and later **bold***. Even ~~strikethrough~~. [A link](https://markdowntohtml.com) to somewhere.');
  const [activeTab, setActiveTab] = useState<'markdown' | 'css'>('markdown');
  const [outputTab, setOutputTab] = useState<'preview' | 'raw'>('preview');
  const [output, setOutput] = useState<string>('');
  const [customCSS, setCustomCSS] = useState<string>('/* Add your custom CSS here */\nbody {\n  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n  line-height: 1.5;\n}\n\nblockquote {\n  border-left: 3px solid #ccc;\n  padding-left: 1rem;\n  color: #666;\n}');
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [markdownLibLoaded, setMarkdownLibLoaded] = useState<boolean>(false);

  // Load the marked library dynamically (since it's client-side only)
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
              .replace(/~~(.*)~~/g, '<del>$1</del>')
              .replace(/\[(.*)\]\((.*)\)/g, '<a href="$2">$1</a>')
              .replace(/^> (.*)/gm, '<blockquote>$1</blockquote>')
              .replace(/^\* (.*)/gm, '<li>$1</li>')
              .replace(/^(\d+)\. (.*)/gm, '<li>$2</li>')
              .replace(/<pre><code>(.*?)<\/code><\/pre>/g, '```\n$1\n```')
              .replace(/<blockquote>(.*?)<\/blockquote>/g, '> $1\n\n')
              .replace(/<ul>([\s\S]*?)<\/ul>/g, (match: string, content: string) => {
                return content
                  .replace(/<li>([\s\S]*?)<\/li>/g, '* $1\n')
                  .replace(/<\/?[^>]+(>|$)/g, '') + '\n';
              })
              .replace(/<ol>([\s\S]*?)<\/ol>/g, (match: string, content: string) => {
                let index = 1;
                return content
                  .replace(/<li>([\s\S]*?)<\/li>/g, (match: string, item: string) => {
                    return `${index++}. ${item}\n`;
                  })
                  .replace(/<\/?[^>]+(>|$)/g, '') + '\n';
              })
              .split('\n\n').map(para => {
                if (para.startsWith('<li>')) {
                  if (/^\<li\>\d+\./.test(para)) {
                    return `<ol>${para}</ol>`;
                  }
                  return `<ul>${para}</ul>`;
                } else if (para.startsWith('<blockquote>')) {
                  return para;
                } else if (para.startsWith('<h')) {
                  return para;
                } else {
                  return `<p>${para}</p>`;
                }
              }).join('\n');
          }
        };
        setMarkdownLibLoaded(true);
      } catch (error) {
        console.error('Failed to load marked library:', error);
      }
    };

    loadMarked();
  }, []);

  // Function to convert markdown to HTML
  useEffect(() => {
    if (!markdownLibLoaded) {
      return;
    }

    try {
      // Convert Markdown to HTML
      const html = window.marked.parse(markdownInput);
      setOutput(html);
    } catch (error: any) {
      console.error('Conversion error:', error);
      setOutput(`Error during conversion: ${error.message}`);
    }
  }, [markdownInput, markdownLibLoaded]);

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

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-2">Convert Markdown to HTML</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Paste or type your markdown and see it rendered as HTML. Download or copy the resulting HTML.
        </p>

        <div className="mb-4">
          <p className="font-medium text-gray-700 dark:text-gray-300">Coming Soon! This page will also allow you to:</p>
          <ul className="list-disc pl-5 mt-2 text-gray-600 dark:text-gray-400">
            <li>Save stylesheets to use with your conversion</li>
            <li>Edit the configuration settings for conversion</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div>
            <div className="border border-gray-300 dark:border-gray-600 rounded-t-md overflow-hidden">
              <div className="flex border-b border-gray-300 dark:border-gray-600">
                <button
                  className={`px-4 py-2 text-sm font-medium ${activeTab === 'markdown' ? 'bg-white dark:bg-gray-700 border-b-2 border-blue-500' : 'bg-gray-100 dark:bg-gray-800'}`}
                  onClick={() => setActiveTab('markdown')}
                >
                  Enter Markdown
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${activeTab === 'css' ? 'bg-white dark:bg-gray-700 border-b-2 border-blue-500' : 'bg-gray-100 dark:bg-gray-800'}`}
                  onClick={() => setActiveTab('css')}
                >
                  Custom CSS
                </button>
              </div>
              <div className={activeTab === 'markdown' ? 'block' : 'hidden'}>
                <textarea
                  value={markdownInput}
                  onChange={(e) => setMarkdownInput(e.target.value)}
                  className="w-full h-96 p-4 font-mono text-sm dark:bg-gray-700 focus:outline-none"
                  placeholder="Enter markdown here..."
                />
              </div>
              <div className={activeTab === 'css' ? 'block' : 'hidden'}>
                <textarea
                  value={customCSS}
                  onChange={(e) => setCustomCSS(e.target.value)}
                  className="w-full h-96 p-4 font-mono text-sm dark:bg-gray-700 focus:outline-none"
                  placeholder="Enter custom CSS here..."
                />
              </div>
            </div>

            <div className="mt-2 flex justify-end space-x-2">
              <button
                onClick={() => { /* This would handle markdown conversion with applied styles */ }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Apply Styles
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div>
            <div className="border border-gray-300 dark:border-gray-600 rounded-t-md overflow-hidden">
              <div className="flex border-b border-gray-300 dark:border-gray-600">
                <button
                  className={`px-4 py-2 text-sm font-medium ${outputTab === 'preview' ? 'bg-white dark:bg-gray-700 border-b-2 border-blue-500' : 'bg-gray-100 dark:bg-gray-800'}`}
                  onClick={() => setOutputTab('preview')}
                >
                  Preview
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${outputTab === 'raw' ? 'bg-white dark:bg-gray-700 border-b-2 border-blue-500' : 'bg-gray-100 dark:bg-gray-800'}`}
                  onClick={() => setOutputTab('raw')}
                >
                  Raw HTML
                </button>
              </div>
              <div className={`h-96 overflow-auto ${outputTab === 'preview' ? 'block' : 'hidden'}`}>
                <div
                  className="p-4"
                  dangerouslySetInnerHTML={{ __html: output }}
                />
              </div>
              <div className={`h-96 overflow-auto ${outputTab === 'raw' ? 'block' : 'hidden'}`}>
                <SyntaxHighlighter
                  language="markup"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '16px',
                    height: '100%',
                    borderRadius: 0,
                    fontSize: '0.875rem'
                  }}
                  wrapLongLines={true}
                >
                  {output}
                </SyntaxHighlighter>
              </div>
            </div>

            <div className="mt-2 flex justify-end space-x-2">
              <button
                onClick={copyToClipboard}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center"
              >
                {copySuccess || 'Copy HTML'}
              </button>
              <button
                onClick={() => {
                  // In a real implementation, this would generate a download
                  const blob = new Blob([output], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'converted.html';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
              >
                Download HTML
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Type declaration for window
declare global {
  interface Window {
    marked: {
      parse: (markdown: string) => string;
    };
  }
}