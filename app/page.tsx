'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4">Available Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
            onClick={() => router.push('/tools/rsync-generator')}
          >
            <h3 className="text-xl font-semibold mb-2">Rsync Command Generator</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Easily generate rsync commands to copy files between local and remote servers
            </p>
            <div className="mt-4">
              <Link href="/tools/rsync-generator" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Open Tool →
              </Link>
            </div>
          </div>
          
          {/* Placeholder for future tools */}
          <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md border-2 border-dashed border-gray-300 dark:border-gray-600">
            <h3 className="text-xl font-semibold mb-2 text-gray-500 dark:text-gray-400">More Tools Coming Soon</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Additional developer tools will be added in future updates
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}