'use client';

import RsyncGenerator from '@/components/RsyncGenerator';
import Link from 'next/link';

export default function RsyncGeneratorPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Link href="/" className="text-blue-500 hover:text-blue-700 mr-2">
          ← Back to Tools
        </Link>
      </div>
      
      <RsyncGenerator />
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">How to Use This Tool</h3>
        <div className="space-y-3">
          <p>
            This tool helps you generate rsync commands for transferring files between local and remote systems.
            Here's how to use it:
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Select the transfer direction (local to remote or remote to local)</li>
            <li>Enter your local path (use trailing slash to copy contents only)</li>
            <li>Enter remote server details (username, server, and path)</li>
            <li>Set SSH port (if different from the default 22)</li>
            <li>Select rsync options to customize your command</li>
            <li>Add any file patterns you want to exclude</li>
            <li>Copy the generated command and run it in your terminal</li>
          </ol>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <strong>Note:</strong> Always verify the command before running it, especially when using the 
            <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded mx-1">--delete</code> option which can 
            permanently remove files from the destination.
          </p>
        </div>
      </div>
    </div>
  );
}