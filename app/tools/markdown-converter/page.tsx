'use client';

import MarkdownConverter from '@/components/MarkdownConverter';
import Link from 'next/link';

export default function MarkdownConverterPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Link href="/" className="text-blue-500 hover:text-blue-700 mr-2">
          ← Back to Tools
        </Link>
      </div>
      
      <MarkdownConverter />
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">How to Use This Tool</h3>
        <div className="space-y-3">
          <p>
            This tool lets you convert between Markdown and HTML formats easily.
            Here's how to use it:
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Select the conversion direction (Markdown to HTML or HTML to Markdown)</li>
            <li>Enter your content in the input box</li>
            <li>See the converted output in real-time</li>
            <li>Use the "Copy to Clipboard" button to copy the result</li>
            <li>If converting to HTML, you can see a live preview of how it will look</li>
          </ol>
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Common Markdown Syntax</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-sm">
                <p className="font-semibold mb-1">Headings</p>
                <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  # Heading 1
                  ## Heading 2
                  ### Heading 3
                </pre>
              </div>
              
              <div className="text-sm">
                <p className="font-semibold mb-1">Emphasis</p>
                <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  *italic*   **bold**
                  _italic_   __bold__
                </pre>
              </div>
              
              <div className="text-sm">
                <p className="font-semibold mb-1">Lists</p>
                <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  - Item 1
                  - Item 2
                    - Nested item
                  
                  1. First item
                  2. Second item
                </pre>
              </div>
              
              <div className="text-sm">
                <p className="font-semibold mb-1">Links & Images</p>
                <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  [Link text](https://example.com)
                  ![Alt text](image-url.jpg)
                </pre>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <strong>Note:</strong> This converter implements the most common Markdown syntax elements.
            For more advanced features, please refer to the complete Markdown specification.
          </p>
        </div>
      </div>
    </div>
  );
}