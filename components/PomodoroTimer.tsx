'use client';

import { useState, useEffect, useRef } from 'react';

interface TimerSettings {
  workDuration: number;  // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // number of pomodoros before long break
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  alarmSound: string;
  alarmVolume: number;
}

type TimerState = 'idle' | 'working' | 'break' | 'longBreak';

export default function PomodoroTimer() {
  // Timer settings state
  const [settings, setSettings] = useState<TimerSettings>({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    alarmSound: 'bell',
    alarmVolume: 0.7
  });

  // Timer state
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeRemaining, setTimeRemaining] = useState<number>(settings.workDuration * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [pomodorosCompleted, setPomodorosCompleted] = useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Audio
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/sounds/bell.mp3');
    audioRef.current.volume = settings.alarmVolume;

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update audio volume when settings change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = settings.alarmVolume;
    }
  }, [settings.alarmVolume]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeRemaining === 0) {
      playSound();
      showNotification();
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining]);

  // Update document title with timer
  useEffect(() => {
    const stateLabels = {
      idle: 'Ready',
      working: 'Working',
      break: 'Break',
      longBreak: 'Long Break'
    };

    const formattedTime = formatTime(timeRemaining);
    const stateLabel = stateLabels[timerState];

    // Set the document title to "MM:SS - State | Original Title"
    const originalTitle = 'Productivity Tools';
    document.title = `${formattedTime} - ${stateLabel} | ${originalTitle}`;

    // Restore original title when component unmounts
    return () => {
      document.title = originalTitle;
    };
  }, [timeRemaining, timerState]);

  // Request notification permission on component mount
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  // Play sound when timer completes
  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.error('Error playing sound:', err));
    }
  };

  // Show browser notification
  const showNotification = () => {
    if (Notification.permission === 'granted') {
      let message = '';
      switch (timerState) {
        case 'working':
          message = 'Time for a break!';
          break;
        case 'break':
        case 'longBreak':
          message = 'Break is over! Time to work!';
          break;
      }

      new Notification('Pomodoro Timer', {
        body: message,
        icon: '/favicon.ico'
      });
    }
  };

  // Handle timer completion
  const handleTimerComplete = () => {
    setIsActive(false);

    if (timerState === 'working') {
      // Increment completed pomodoros
      const newPomodorosCompleted = pomodorosCompleted + 1;
      setPomodorosCompleted(newPomodorosCompleted);

      // Determine if it's time for a long break
      if (newPomodorosCompleted % settings.longBreakInterval === 0) {
        setTimerState('longBreak');
        setTimeRemaining(settings.longBreakDuration * 60);
      } else {
        setTimerState('break');
        setTimeRemaining(settings.breakDuration * 60);
      }

      // Auto-start break if enabled
      if (settings.autoStartBreaks) {
        setIsActive(true);
      }
    } else {
      // Break is complete, reset to work state
      setTimerState('working');
      setTimeRemaining(settings.workDuration * 60);

      // Auto-start pomodoro if enabled
      if (settings.autoStartPomodoros) {
        setIsActive(true);
      }
    }
  };

  // Start or resume timer
  const startTimer = () => {
    if (timerState === 'idle') {
      setTimerState('working');
      setTimeRemaining(settings.workDuration * 60);
    }
    setIsActive(true);
  };

  // Pause timer
  const pauseTimer = () => {
    setIsActive(false);
  };

  // Reset timer
  const resetTimer = () => {
    setIsActive(false);

    if (timerState === 'working') {
      setTimeRemaining(settings.workDuration * 60);
    } else if (timerState === 'break') {
      setTimeRemaining(settings.breakDuration * 60);
    } else if (timerState === 'longBreak') {
      setTimeRemaining(settings.longBreakDuration * 60);
    }
  };

  // Skip to next timer
  const skipTimer = () => {
    setIsActive(false);

    if (timerState === 'working') {
      const newPomodorosCompleted = pomodorosCompleted + 1;
      setPomodorosCompleted(newPomodorosCompleted);

      if (newPomodorosCompleted % settings.longBreakInterval === 0) {
        setTimerState('longBreak');
        setTimeRemaining(settings.longBreakDuration * 60);
      } else {
        setTimerState('break');
        setTimeRemaining(settings.breakDuration * 60);
      }
    } else {
      setTimerState('working');
      setTimeRemaining(settings.workDuration * 60);
    }
  };

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get progress percentage for progress bar
  const getProgressPercentage = (): number => {
    let totalTime = 0;

    switch (timerState) {
      case 'working':
        totalTime = settings.workDuration * 60;
        break;
      case 'break':
        totalTime = settings.breakDuration * 60;
        break;
      case 'longBreak':
        totalTime = settings.longBreakDuration * 60;
        break;
      default:
        return 0;
    }

    return 100 - ((timeRemaining / totalTime) * 100);
  };

  // Update a specific setting
  const updateSetting = (key: keyof TimerSettings, value: number | boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));

    // Update timer if it's not active
    if (!isActive) {
      if (timerState === 'working' && key === 'workDuration') {
        setTimeRemaining((value as number) * 60);
      } else if (timerState === 'break' && key === 'breakDuration') {
        setTimeRemaining((value as number) * 60);
      } else if (timerState === 'longBreak' && key === 'longBreakDuration') {
        setTimeRemaining((value as number) * 60);
      }
    }
  };

  // Get timer state label
  const getTimerStateLabel = (): string => {
    switch (timerState) {
      case 'idle':
        return 'Ready';
      case 'working':
        return `Working (${pomodorosCompleted + 1}/${settings.longBreakInterval})`;
      case 'break':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Pomodoro Timer</h2>

      {/* Timer Display */}
      <div className="mb-6 text-center">
        <div className="mb-2 text-lg font-medium">{getTimerStateLabel()}</div>
        <div className="text-5xl font-bold mb-4">{formatTime(timeRemaining)}</div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full ${timerState === 'working' ? 'bg-red-500' : timerState === 'break' ? 'bg-green-500' : 'bg-blue-500'}`}
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>

        {/* Timer Controls */}
        <div className="flex justify-center space-x-4 mb-6">
          {!isActive ? (
            <button
              onClick={startTimer}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              {timeRemaining === (timerState === 'working' ? settings.workDuration * 60 :
                timerState === 'break' ? settings.breakDuration * 60 :
                  settings.longBreakDuration * 60) ? 'Start' : 'Resume'}
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              Pause
            </button>
          )}

          <button
            onClick={resetTimer}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Reset
          </button>

          <button
            onClick={skipTimer}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Skip
          </button>
        </div>

        {/* Session Count */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Pomodoros completed: {pomodorosCompleted}
        </div>
      </div>

      {/* Settings Toggle */}
      <div className="text-center mb-4">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {showSettings ? 'Hide Settings' : 'Show Settings'}
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-t pt-4 dark:border-gray-700">
          <h3 className="font-medium mb-3">Timer Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm mb-1">Work Duration (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.workDuration}
                onChange={(e) => updateSetting('workDuration', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Short Break (minutes)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.breakDuration}
                onChange={(e) => updateSetting('breakDuration', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Long Break (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.longBreakDuration}
                onChange={(e) => updateSetting('longBreakDuration', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Long Break After (pomodoros)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.longBreakInterval}
                onChange={(e) => updateSetting('longBreakInterval', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">Alarm Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.alarmVolume}
              onChange={(e) => updateSetting('alarmVolume', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs">
              <span>Off</span>
              <span>Max</span>
            </div>
          </div>

          <div className="flex flex-col space-y-2 mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.autoStartBreaks}
                onChange={(e) => updateSetting('autoStartBreaks', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Auto-start breaks</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.autoStartPomodoros}
                onChange={(e) => updateSetting('autoStartPomodoros', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Auto-start pomodoros</span>
            </label>
          </div>

          <div className="mb-4">
            <button
              onClick={() => playSound()}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Test Sound
            </button>
          </div>
        </div>
      )}
    </div>
  );
}