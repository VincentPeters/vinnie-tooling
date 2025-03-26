'use client';

import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type TransferDirection = 'local-to-remote' | 'remote-to-local' | 'server-to-server';

interface RsyncOption {
  flag: string;
  description: string;
  default: boolean;
}

interface ServerConfig {
  username: string;
  server: string;
  path: string;
  port: string;
}

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  size: string;
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

  // Server to server configs
  const [sourceServer, setSourceServer] = useState<ServerConfig>({
    username: 'source-user',
    server: 'source-server',
    path: '/source/path/',
    port: '22'
  });

  const [destServer, setDestServer] = useState<ServerConfig>({
    username: 'dest-user',
    server: 'dest-server',
    path: '/destination/path/',
    port: '22'
  });

  // Simulation state
  const [showSimulation, setShowSimulation] = useState<boolean>(false);
  const [simulatedFiles, setSimulatedFiles] = useState<{
    source: FileItem[];
    destination: FileItem[];
    transferred: FileItem[];
  }>({
    source: [
      { name: 'data.txt', type: 'file', size: '5.4 KB' },
      { name: 'images/', type: 'directory', size: '-- KB' },
      { name: 'images/photo1.jpg', type: 'file', size: '1.2 MB' },
      { name: 'images/photo2.jpg', type: 'file', size: '950 KB' },
      { name: 'config.json', type: 'file', size: '2.1 KB' },
      { name: 'logs/', type: 'directory', size: '-- KB' },
      { name: 'logs/app.log', type: 'file', size: '234 KB' },
    ],
    destination: [
      { name: 'data.txt', type: 'file', size: '4.9 KB' },
      { name: 'images/', type: 'directory', size: '-- KB' },
      { name: 'images/photo1.jpg', type: 'file', size: '1.2 MB' },
      { name: 'config.json', type: 'file', size: '1.8 KB' },
    ],
    transferred: []
  });

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

  // Update server config
  const updateServerConfig = (server: 'source' | 'dest', field: keyof ServerConfig, value: string) => {
    if (server === 'source') {
      setSourceServer(prev => ({ ...prev, [field]: value }));
    } else {
      setDestServer(prev => ({ ...prev, [field]: value }));
    }
  };

  // Generate simulated files
  useEffect(() => {
    if (!showSimulation) return;

    const dryRunOption = options.find(opt => opt.flag === 'n');
    const isDeleteEnabled = options.find(opt => opt.flag === '--delete')?.default;
    const excludeOption = options.find(opt => opt.flag === '--exclude');

    // Only process files not in exclude patterns
    const shouldIncludeFile = (name: string) => {
      if (!excludeOption?.default) return true;
      return !excludePatterns.some(pattern => {
        // Simple pattern matching (in real life this would be more sophisticated)
        if (pattern.endsWith('/')) {
          return name.startsWith(pattern) || name === pattern.slice(0, -1);
        }
        return name === pattern;
      });
    };

    // Files that would be transferred (modified or new)
    const transferred = simulatedFiles.source
      .filter(sourceFile => {
        if (!shouldIncludeFile(sourceFile.name)) return false;

        const destFile = simulatedFiles.destination.find(df => df.name === sourceFile.name);

        // File doesn't exist in destination or is different size (needs update)
        return !destFile || (destFile.size !== sourceFile.size && sourceFile.type === 'file');
      });

    // Files that would be deleted if --delete is enabled
    const deleted = isDeleteEnabled ?
      simulatedFiles.destination.filter(destFile =>
        shouldIncludeFile(destFile.name) &&
        !simulatedFiles.source.some(sf => sf.name === destFile.name)
      ) : [];

    // Update the transferred files
    setSimulatedFiles(prev => ({
      ...prev,
      transferred: [
        ...transferred,
        ...deleted.map(file => ({ ...file, size: 'DELETED' }))
      ]
    }));

  }, [showSimulation, options, excludePatterns, direction]);

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

    // Add SSH options
    const sshOption = options.find(opt => opt.flag === 'e');

    // Add exclude patterns
    const excludeOption = options.find(opt => opt.flag === '--exclude');
    if (excludeOption?.default && excludePatterns.length > 0) {
      excludePatterns.forEach(pattern => {
        rsyncCmd += `--exclude="${pattern}" `;
      });
    }

    // Add source and destination based on direction
    if (direction === 'local-to-remote') {
      if (sshOption?.default && port !== '22') {
        rsyncCmd += `-e "ssh -p ${port}" `;
      }
      rsyncCmd += `${localPath} ${remotePath}`;
    } else if (direction === 'remote-to-local') {
      if (sshOption?.default && port !== '22') {
        rsyncCmd += `-e "ssh -p ${port}" `;
      }
      rsyncCmd += `${remotePath} ${localPath}`;
    } else if (direction === 'server-to-server') {
      // For server to server, ssh options are more complex
      let sshOptions = '';

      if (sourceServer.port !== '22') {
        sshOptions = `-e "ssh -p ${sourceServer.port}"`;
      }

      const sourcePath = `${sourceServer.username}@${sourceServer.server}:${sourceServer.path}`;
      const destPath = `${destServer.username}@${destServer.server}:${destServer.path}`;

      if (sshOptions) {
        rsyncCmd += `${sshOptions} `;
      }

      rsyncCmd += `${sourcePath} `;

      // For server-to-server, we need to specify the rsync path on the remote server
      rsyncCmd += `--rsync-path="ssh -p ${destServer.port} ${destServer.username}@${destServer.server} rsync" ${destPath}`;
    }

    setCommand(rsyncCmd);
  }, [options, localPath, remotePath, direction, port, excludePatterns, sourceServer, destServer]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Rsync Command Generator</h2>

        {/* Direction Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Transfer Direction</label>
          <div className="flex flex-wrap gap-2">
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
            <button
              className={`px-4 py-2 rounded-md ${direction === 'server-to-server'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
              onClick={() => setDirection('server-to-server')}
            >
              Server → Server
            </button>
          </div>
        </div>

        {/* Path Configuration */}
        {direction === 'server-to-server' ? (
          <div className="mb-6">
            {/* Server side by side layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Source Server */}
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <h4 className="text-md font-medium mb-3">Source Server</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Username</label>
                      <input
                        type="text"
                        value={sourceServer.username}
                        onChange={(e) => updateServerConfig('source', 'username', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        placeholder="username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Server</label>
                      <input
                        type="text"
                        value={sourceServer.server}
                        onChange={(e) => updateServerConfig('source', 'server', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        placeholder="server"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Path</label>
                    <input
                      type="text"
                      value={sourceServer.path}
                      onChange={(e) => updateServerConfig('source', 'path', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                      placeholder="/source/path/"
                    />
                    <p className="text-xs text-gray-500 mt-1">Add trailing slash to copy contents only</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">SSH Port</label>
                    <input
                      type="text"
                      value={sourceServer.port}
                      onChange={(e) => updateServerConfig('source', 'port', e.target.value)}
                      className="w-full md:w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                      placeholder="22"
                    />
                  </div>
                </div>
              </div>

              {/* Destination Server */}
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <h4 className="text-md font-medium mb-3">Destination Server</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Username</label>
                      <input
                        type="text"
                        value={destServer.username}
                        onChange={(e) => updateServerConfig('dest', 'username', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        placeholder="username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Server</label>
                      <input
                        type="text"
                        value={destServer.server}
                        onChange={(e) => updateServerConfig('dest', 'server', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        placeholder="server"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Path</label>
                    <input
                      type="text"
                      value={destServer.path}
                      onChange={(e) => updateServerConfig('dest', 'path', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                      placeholder="/destination/path/"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">SSH Port</label>
                    <input
                      type="text"
                      value={destServer.port}
                      onChange={(e) => updateServerConfig('dest', 'port', e.target.value)}
                      className="w-full md:w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                      placeholder="22"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            {direction === 'local-to-remote' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Local Box */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h4 className="text-md font-medium mb-3">Local</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Path</label>
                      <input
                        type="text"
                        value={localPath}
                        onChange={(e) => setLocalPath(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        placeholder="./local/path/"
                      />
                      <p className="text-xs text-gray-500 mt-1">Add trailing slash to copy contents only</p>
                    </div>
                  </div>
                </div>

                {/* Remote Box */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h4 className="text-md font-medium mb-3">Remote Server</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                          placeholder="username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Server</label>
                        <input
                          type="text"
                          value={server}
                          onChange={(e) => setServer(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                          placeholder="server"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Path</label>
                      <input
                        type="text"
                        value={remotePath.split(':')[1] || ''}
                        onChange={(e) => setRemotePath(`${username}@${server}:${e.target.value}`)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        placeholder="/remote/path/"
                      />
                      <p className="text-xs text-gray-500 mt-1">Remote path (e.g., /var/www/html/)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">SSH Port</label>
                      <input
                        type="text"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        className="w-full md:w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        placeholder="22"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Remote Box */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h4 className="text-md font-medium mb-3">Remote Server</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                          placeholder="username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Server</label>
                        <input
                          type="text"
                          value={server}
                          onChange={(e) => setServer(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                          placeholder="server"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Path</label>
                      <input
                        type="text"
                        value={remotePath.split(':')[1] || ''}
                        onChange={(e) => setRemotePath(`${username}@${server}:${e.target.value}`)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        placeholder="/remote/path/"
                      />
                      <p className="text-xs text-gray-500 mt-1">Remote path (e.g., /var/www/html/)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">SSH Port</label>
                      <input
                        type="text"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        className="w-full md:w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        placeholder="22"
                      />
                    </div>
                  </div>
                </div>

                {/* Local Box */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h4 className="text-md font-medium mb-3">Local</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Path</label>
                      <input
                        type="text"
                        value={localPath}
                        onChange={(e) => setLocalPath(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        placeholder="./local/path/"
                      />
                      <p className="text-xs text-gray-500 mt-1">Add trailing slash to copy contents only</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
                className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
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
          <div className="space-x-2">
            <button
              onClick={() => setShowSimulation(!showSimulation)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md"
            >
              {showSimulation ? "Hide" : "Show"} Simulation
            </button>
            <button
              onClick={copyToClipboard}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
            >
              Copy Command
            </button>
          </div>
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

        {/* Simulation Output */}
        {showSimulation && (
          <div className="mt-6 border-t pt-4 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">File Transfer Simulation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This is a simulated preview of what would be transferred with the current rsync command.
              {!options.find(opt => opt.flag === 'n')?.default && (
                <span className="text-yellow-600"> (Add the dry-run option to see this in reality before running)</span>
              )}
            </p>

            {/* Transfer direction visual indicator */}
            <div className="mb-6 flex items-center justify-center">
              <div className={`px-4 py-2 rounded-lg font-medium ${direction === 'local-to-remote' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  direction === 'remote-to-local' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                }`}>
                {direction === 'local-to-remote' ? (
                  <>
                    <span className="font-bold">Local</span> ({localPath})
                    <span className="mx-2">→</span>
                    <span className="font-bold">Remote</span> ({remotePath})
                  </>
                ) : direction === 'remote-to-local' ? (
                  <>
                    <span className="font-bold">Remote</span> ({remotePath})
                    <span className="mx-2">→</span>
                    <span className="font-bold">Local</span> ({localPath})
                  </>
                ) : (
                  <>
                    <span className="font-bold">Source Server</span> ({sourceServer.username}@{sourceServer.server}:{sourceServer.path})
                    <span className="mx-2">→</span>
                    <span className="font-bold">Destination Server</span> ({destServer.username}@{destServer.server}:{destServer.path})
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Source Files */}
              <div>
                <h4 className="font-medium mb-2">
                  {direction === 'local-to-remote' ? 'Local Source Files' :
                    direction === 'remote-to-local' ? 'Remote Source Files' :
                      'Source Server Files'}
                </h4>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded max-h-60 overflow-y-auto">
                  <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">
                    <strong>Path:</strong> {direction === 'server-to-server' ?
                      `${sourceServer.path}` :
                      direction === 'local-to-remote' ? localPath : remotePath}
                  </div>
                  <table className="w-full text-sm">
                    <thead className="text-left">
                      <tr>
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulatedFiles.source.map((file, index) => (
                        <tr key={index} className="border-t dark:border-gray-600">
                          <td className="py-1 pr-2">{file.name}</td>
                          <td className="py-1 pr-2">{file.type}</td>
                          <td className="py-1">{file.size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Destination Files (Before) */}
              <div>
                <h4 className="font-medium mb-2">
                  {direction === 'local-to-remote' ? 'Remote Destination (Before Transfer)' :
                    direction === 'remote-to-local' ? 'Local Destination (Before Transfer)' :
                      'Destination Server (Before Transfer)'}
                </h4>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded max-h-60 overflow-y-auto">
                  <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">
                    <strong>Path:</strong> {direction === 'server-to-server' ?
                      `${destServer.path}` :
                      direction === 'local-to-remote' ? remotePath : localPath}
                  </div>
                  {simulatedFiles.destination.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead className="text-left">
                        <tr>
                          <th className="pb-2">Name</th>
                          <th className="pb-2">Type</th>
                          <th className="pb-2">Size</th>
                        </tr>
                      </thead>
                      <tbody>
                        {simulatedFiles.destination.map((file, index) => (
                          <tr key={index} className="border-t dark:border-gray-600">
                            <td className="py-1 pr-2">{file.name}</td>
                            <td className="py-1 pr-2">{file.type}</td>
                            <td className="py-1">{file.size}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500 italic">No files in destination</p>
                  )}
                </div>
              </div>
            </div>

            {/* Files that would be transferred */}
            <div className="mt-6">
              <h4 className="font-medium mb-2">
                Files That Will Be Transferred{' '}
                <span className="text-gray-500 text-sm">({simulatedFiles.transferred.length} items)</span>
              </h4>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded max-h-60 overflow-y-auto">
                {simulatedFiles.transferred.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead className="text-left">
                      <tr>
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulatedFiles.transferred.map((file, index) => (
                        <tr key={index} className="border-t dark:border-gray-600">
                          <td className="py-1 pr-2">{file.name}</td>
                          <td className="py-1 pr-2">{file.type}</td>
                          <td className="py-1">
                            {file.size === 'DELETED' ? (
                              <span className="text-red-500 font-medium">Deleted from destination</span>
                            ) : simulatedFiles.destination.some(df => df.name === file.name) ? (
                              <span className="text-blue-500 font-medium">Updated in destination</span>
                            ) : (
                              <span className="text-green-500 font-medium">Copied to destination</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 italic">No files would be transferred</p>
                )}
              </div>
            </div>

            {/* Resulting folder structure */}
            <div className="mt-6">
              <h4 className="font-medium mb-2">
                Resulting Folder Structure
              </h4>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded max-h-60 overflow-y-auto">
                <div className="mb-2 text-sm">
                  <strong>
                    {direction === 'local-to-remote' ? 'Remote Destination Path' :
                      direction === 'remote-to-local' ? 'Local Destination Path' :
                        'Destination Server Path'}:
                  </strong>{' '}
                  {direction === 'server-to-server' ?
                    destServer.path :
                    direction === 'local-to-remote' ? remotePath : localPath}
                </div>

                <div className="font-mono text-sm border-l-2 border-gray-400 dark:border-gray-500 pl-3">
                  {/* Create a tree-like folder structure visualization */}
                  {(() => {
                    // Get all files that would be in the destination after transfer
                    const allDestFiles = [
                      ...simulatedFiles.destination.filter(file =>
                        !simulatedFiles.transferred.some(tf =>
                          tf.size === 'DELETED' && tf.name === file.name
                        )
                      ),
                      ...simulatedFiles.transferred.filter(file => file.size !== 'DELETED')
                    ];

                    // Sort to get directories first, then files
                    allDestFiles.sort((a, b) => {
                      if (a.type === 'directory' && b.type !== 'directory') return -1;
                      if (a.type !== 'directory' && b.type === 'directory') return 1;
                      return a.name.localeCompare(b.name);
                    });

                    // Create a simplified folder structure
                    const filesByDir: Record<string, FileItem[]> = {};
                    const topLevelItems: FileItem[] = [];

                    allDestFiles.forEach(file => {
                      if (file.name.includes('/')) {
                        const parts = file.name.split('/');
                        const dirName = parts[0] + '/';

                        if (!filesByDir[dirName]) {
                          filesByDir[dirName] = [];
                        }

                        if (parts.length === 2 && parts[1] !== '') {
                          filesByDir[dirName].push(file);
                        }
                      } else {
                        topLevelItems.push(file);
                      }
                    });

                    return (
                      <div>
                        {topLevelItems.map((file, i) => (
                          <div key={i} className="flex items-center">
                            {file.type === 'directory' ? (
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            )}
                            <span className={
                              simulatedFiles.transferred.some(tf => tf.name === file.name && tf.size !== 'DELETED')
                                ? "text-green-600 dark:text-green-400"
                                : ""
                            }>
                              {file.name}
                            </span>
                          </div>
                        ))}

                        {Object.entries(filesByDir).map(([dirName, files], i) => (
                          <div key={i}>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                              <span>{dirName}</span>
                            </div>
                            <div className="pl-5 border-l border-gray-300 dark:border-gray-600">
                              {files.map((file, j) => (
                                <div key={j} className="flex items-center mt-1">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  <span className={
                                    simulatedFiles.transferred.some(tf => tf.name === file.name && tf.size !== 'DELETED')
                                      ? "text-green-600 dark:text-green-400"
                                      : ""
                                  }>
                                    {file.name.split('/')[1]}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}