'use client';

import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type TransferDirection = 'local-to-remote' | 'remote-to-local';

interface RsyncOption {
  flag: string;
  description: string;
  default: boolean;
}

export default function RsyncGenerator() {
  // Form state
  const [localPath, setLocalPath] = useState<string>('./local/path/');
  const [remotePath, setRemotePath] = useState<string>('user@server:/remote/path/');
  const [direction, setDirection] = useState<TransferDirection>('local-to-remote');
  const [username, setUsername] = useState<string>('user');
  const [server, setServer] = useState<string>('server');
  const [port, setPort] = useState<string>('22');
  const [command, setCommand] = useState<string>('');

  // Common rsync options
  const [options, setOptions] = useState<RsyncOption[]>([
    { flag: 'a', description: 'Archive mode (recursive, preserves permissions, etc.)', default: false },
    { flag: 'v', description: 'Verbose output', default: true },
    { flag: 'z', description: 'Compress file data during transfer', default: true },
    { flag: 'P', description: 'Show progress and keep partially transferred files', default: true },
    { flag: 'n', description: 'Dry run (simulation)', default: false },
    { flag: 'u', description: 'Skip files that are newer on the destination', default: false },
    { flag: 'h', description: 'Output numbers in a human-readable format', default: false },
    { flag: 'e', description: 'Specify the remote shell', default: true },
    { flag: '--delete', description: 'Delete files on destination that don\'t exist on source', default: false },
    { flag: '--exclude', description: 'Exclude files matching pattern', default: false },
  ]);

  // State for exclude patterns
  const [excludePatterns, setExcludePatterns] = useState<string[]>(['node_modules/', '.git/']);
  const [newExcludePattern, setNewExcludePattern] = useState<string>('');

  // Copy command to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(command)
      .then(() => {
        alert('Command copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  // Add new exclude pattern
  const addExcludePattern = () => {
    if (newExcludePattern.trim() !== '') {
      setExcludePatterns([...excludePatterns, newExcludePattern.trim()]);
      setNewExcludePattern('');
    }
  };

  // Remove exclude pattern
  const removeExcludePattern = (index: number) => {
    const newPatterns = [...excludePatterns];
    newPatterns.splice(index, 1);
    setExcludePatterns(newPatterns);
  };

  // Toggle option selection
  const toggleOption = (index: number) => {
    const newOptions = [...options];
    newOptions[index].default = !newOptions[index].default;
    setOptions(newOptions);
  };

  // Update remote path when username or server changes
  useEffect(() => {
    const serverPart = remotePath.split(':')[1] || '/remote/path/';
    setRemotePath(`${username}@${server}:${serverPart}`);
  }, [username, server]);

  // Generate rsync command
  useEffect(() => {
    let rsyncCmd = 'rsync ';

    // Add options
    let optionFlags = '';
    options.forEach(option => {
      if (option.default) {
        if (option.flag.startsWith('--')) {
          // Handle long options like --delete separately
          if (option.flag === '--exclude') {
            // We'll handle excludes separately
          } else {
            optionFlags += ` ${option.flag}`;
          }
        } else if (option.flag === 'e') {
          // Handle SSH port specification separately
          // We'll add this later
        } else {
          optionFlags += option.flag;
        }
      }
    });

    if (optionFlags) {
      rsyncCmd += `-${optionFlags} `;
    }

    // Add SSH options if port is not default
    const sshOption = options.find(opt => opt.flag === 'e');
    if (sshOption?.default && port !== '22') {
      rsyncCmd += `-e "ssh -p ${port}" `;
    }

    // Add exclude patterns
    const excludeOption = options.find(opt => opt.flag === '--exclude');
    if (excludeOption?.default && excludePatterns.length > 0) {
      excludePatterns.forEach(pattern => {
        rsyncCmd += `--exclude="${pattern}" `;
      });
    }

    // Add source and destination based on direction
    if (direction === 'local-to-remote') {
      rsyncCmd += `${localPath} ${remotePath}`;
    } else {
      rsyncCmd += `${remotePath} ${localPath}`;
    }

    setCommand(rsyncCmd);
  }, [options, localPath, remotePath, direction, port, excludePatterns]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Rsync Command Generator</h2>

        {/* Direction Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Transfer Direction</label>
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-md ${direction === 'local-to-remote'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
              onClick={() => setDirection('local-to-remote')}
            >
              Local → Remote
            </button>
            <button
              className={`px-4 py-2 rounded-md ${direction === 'remote-to-local'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
              onClick={() => setDirection('remote-to-local')}
            >
              Remote → Local
            </button>
          </div>
        </div>

        {/* Path Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {direction === 'local-to-remote' ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Local Path</label>
                <input
                  type="text"
                  value={localPath}
                  onChange={(e) => setLocalPath(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                  placeholder="./local/path/"
                />
                <p className="text-xs text-gray-500 mt-1">Add trailing slash to copy contents only</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Remote Server Details</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                    placeholder="username"
                  />
                  <input
                    type="text"
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                    placeholder="server"
                  />
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    value={remotePath.split(':')[1] || ''}
                    onChange={(e) => setRemotePath(`${username}@${server}:${e.target.value}`)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                    placeholder="/remote/path/"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Remote path (e.g., /var/www/html/)</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Remote Server Details</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                    placeholder="username"
                  />
                  <input
                    type="text"
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                    placeholder="server"
                  />
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    value={remotePath.split(':')[1] || ''}
                    onChange={(e) => setRemotePath(`${username}@${server}:${e.target.value}`)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                    placeholder="/remote/path/"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Remote path (e.g., /var/www/html/)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Local Path</label>
                <input
                  type="text"
                  value={localPath}
                  onChange={(e) => setLocalPath(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                  placeholder="./local/path/"
                />
                <p className="text-xs text-gray-500 mt-1">Add trailing slash to copy contents only</p>
              </div>
            </>
          )}
        </div>

        {/* Port Configuration */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">SSH Port</label>
          <input
            type="text"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="w-full md:w-1/4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
            placeholder="22"
          />
        </div>

        {/* Options Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Rsync Options</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {options.map((option, index) => (
              <div key={option.flag} className="flex items-center">
                <input
                  type="checkbox"
                  id={`option-${option.flag}`}
                  checked={option.default}
                  onChange={() => toggleOption(index)}
                  className="mr-2"
                />
                <label htmlFor={`option-${option.flag}`} className="text-sm">
                  <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{option.flag}</code>
                  <span className="ml-2">{option.description}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Exclude Patterns */}
        {options.find(opt => opt.flag === '--exclude')?.default && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Exclude Patterns</label>
            <div className="flex mb-2">
              <input
                type="text"
                value={newExcludePattern}
                onChange={(e) => setNewExcludePattern(e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md dark:bg-gray-700"
                placeholder="pattern to exclude (e.g., *.log)"
                onKeyDown={(e) => e.key === 'Enter' && addExcludePattern()}
              />
              <button
                onClick={addExcludePattern}
                className="bg-blue-500 text-white px-4 py-2 rounded-r-md"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {excludePatterns.map((pattern, index) => (
                <div key={index} className="flex items-center bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  <code className="flex-grow">{pattern}</code>
                  <button
                    onClick={() => removeExcludePattern(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {excludePatterns.length === 0 && (
                <p className="text-gray-500 text-sm italic">No exclude patterns added</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Command Output */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Generated Command</h3>
          <button
            onClick={copyToClipboard}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
          >
            Copy Command
          </button>
        </div>
        <div className="relative overflow-hidden rounded-md">
          <SyntaxHighlighter
            language="bash"
            style={vscDarkPlus}
            customStyle={{ margin: 0, padding: '16px', borderRadius: '6px' }}
          >
            {command}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}