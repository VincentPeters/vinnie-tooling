'use client';

import PomodoroTimer from '@/components/PomodoroTimer';
import Link from 'next/link';

export default function PomodoroTimerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Link href="/" className="text-blue-500 hover:text-blue-700 mr-2">
          ← Back to Tools
        </Link>
      </div>

      <PomodoroTimer />

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">How to Use This Tool</h3>
        <div className="space-y-3">
          <p>
            The Pomodoro Technique is a time management method that uses a timer to break work into intervals,
            traditionally 25 minutes in length, separated by short breaks.
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Start a 25-minute pomodoro timer when you're ready to focus</li>
            <li>Work on your task until the timer rings</li>
            <li>Take a short 5-minute break</li>
            <li>After completing four pomodoros, take a longer 15-30 minute break</li>
          </ol>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <strong>Note:</strong> You can customize all timer durations, notification settings, and sounds in the settings panel.
            The tool will notify you when each interval ends if you allow browser notifications.
          </p>
        </div>
      </div>
    </div>
  );
}