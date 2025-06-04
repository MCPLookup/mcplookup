"use client"

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export function ConnectionStatus({ isConnected, isConnecting, error }: ConnectionStatusProps) {
  const getStatusColor = () => {
    if (error) return 'bg-red-500';
    if (isConnecting) return 'bg-yellow-500';
    if (isConnected) return 'bg-green-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (error) return 'Connection Error';
    if (isConnecting) return 'Connecting...';
    if (isConnected) return 'Live';
    return 'Disconnected';
  };

  const getStatusIcon = () => {
    if (error) return '❌';
    if (isConnecting) return '🔄';
    if (isConnected) return '🟢';
    return '⚫';
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${isConnecting ? 'animate-pulse' : ''}`}></div>
      <span className="text-sm font-medium text-gray-700">
        {getStatusIcon()} {getStatusText()}
      </span>
      {error && (
        <div className="relative group">
          <span className="text-red-500 cursor-help">ⓘ</span>
          <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-red-50 border border-red-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
