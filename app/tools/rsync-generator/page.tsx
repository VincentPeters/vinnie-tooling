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
            This tool helps you generate rsync commands for transferring files between local and remote systems
            or between two remote servers. Here's how to use it:
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Select the transfer direction (local ↔ remote or server → server)</li>
            <li>Enter source and destination details based on your selected direction</li>
            <li>For server-to-server transfers, configure both source and destination server details</li>
            <li>Set SSH port(s) if different from the default 22</li>
            <li>Select rsync options to customize your command</li>
            <li>Add any file patterns you want to exclude</li>
            <li>View the simulation to see which files would be transferred</li>
            <li>Copy the generated command and run it in your terminal</li>
          </ol>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              <strong>Note:</strong> Always verify the command before running it, especially when using the
              <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded mx-1">--delete</code> option which can
              permanently remove files from the destination.
            </p>
            <p>
              <strong>Server to Server Transfer:</strong> For transfers between two remote servers, the rsync command
              is executed from the source server. The source server needs to have SSH access to the destination server.
            </p>
            <p>
              <strong>File Simulation:</strong> The "Show Simulation" button provides a visual preview of
              which files would be transferred, updated, or deleted. Enable the
              <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded mx-1">-n</code> (dry run) option
              to test your command safely before executing it for real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}