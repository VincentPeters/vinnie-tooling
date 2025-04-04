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

          <div
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
            onClick={() => router.push('/tools/markdown-converter')}
          >
            <h3 className="text-xl font-semibold mb-2">Markdown ↔ HTML Converter</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Convert between Markdown and HTML formats with live preview
            </p>
            <div className="mt-4">
              <Link href="/tools/markdown-converter" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Open Tool →
              </Link>
            </div>
          </div>

          <div
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
            onClick={() => router.push('/tools/pomodoro-timer')}
          >
            <h3 className="text-xl font-semibold mb-2">Pomodoro Timer</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Focus better with a configurable Pomodoro timer with notifications and sound alerts
            </p>
            <div className="mt-4">
              <Link href="/tools/pomodoro-timer" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Open Tool →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}