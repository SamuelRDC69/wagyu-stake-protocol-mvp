// src/components/Settings/NetworkSettings.tsx
import { useState } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Badge,
  Progress,
  Tooltip 
} from '../common';
import { useSettings } from '../../hooks/useSettings';
import { 
  Network,
  Server,
  Activity,
  RefreshCw,
  Shield,
  CheckCircle,
  XCircle,
  Globe
} from 'lucide-react';

const NetworkSettings = () => {
  const { 
    networkConfig,
    updateNetworkSettings,
    availableEndpoints,
    testConnection,
    chainStatus
  } = useSettings();

  const [isUpdating, setIsUpdating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [localConfig, setLocalConfig] = useState(networkConfig);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await updateNetworkSettings(localConfig);
    } catch (error) {
      console.error('Failed to update network settings:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      await testConnection();
    } catch (error) {
      console.error('Connection test failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card variant="game">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Network className="w-6 h-6 text-primary" />
          <Typography.H3>Network Settings</Typography.H3>
        </div>
        {JSON.stringify(localConfig) !== JSON.stringify(networkConfig) && (
          <Button
            variant="primary"
            size="sm"
            isLoading={isUpdating}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Chain Status */}
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-primary" />
              <Typography.Label>WAX Chain Status</Typography.Label>
            </div>
            <Button
              variant="secondary"
              size="sm"
              isLoading={isTesting}
              onClick={handleTestConnection}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Test Connection
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Typography.Small className="text-gray-500">Block Height</Typography.Small>
              <Typography.Body>{chainStatus.headBlock}</Typography.Body>
            </div>
            <div>
              <Typography.Small className="text-gray-500">Block Time</Typography.Small>
              <Typography.Body>{chainStatus.blockTime}ms</Typography.Body>
            </div>
            <div>
              <Typography.Small className="text-gray-500">Server Version</Typography.Small>
              <Typography.Body>{chainStatus.serverVersion}</Typography.Body>
            </div>
            <div>
              <Typography.Small className="text-gray-500">Chain ID</Typography.Small>
              <Tooltip content={chainStatus.chainId}>
                <Typography.Body>
                  {chainStatus.chainId.slice(0, 8)}...
                </Typography.Body>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-4 h-4 text-primary" />
            <Typography.Label>API Endpoints</Typography.Label>
          </div>
          <div className="space-y-3">
            {availableEndpoints.map(endpoint => (
              <div 
                key={endpoint.url}
                className={`p-4 rounded-lg ${
                  localConfig.selectedEndpoint === endpoint.url
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="endpoint"
                      checked={localConfig.selectedEndpoint === endpoint.url}
                      onChange={() => setLocalConfig(prev => ({
                        ...prev,
                        selectedEndpoint: endpoint.url
                      }))}
                    />
                    <div>
                      <Typography.Body>{endpoint.name}</Typography.Body>
                      <Typography.Small className="text-gray-500 font-mono">
                        {endpoint.url}
                      </Typography.Small>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      endpoint.latency < 100 ? 'success' :
                      endpoint.latency < 300 ? 'warning' :
                      'danger'
                    }>
                      {endpoint.latency}ms
                    </Badge>
                    {endpoint.features.map((feature, index) => (
                      <Tooltip key={index} content={feature}>
                        <Shield className="w-4 h-4 text-primary" />
                      </Tooltip>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connection Settings */}
        <div>
          <Typography.Label className="mb-4">Connection Settings</Typography.Label>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div>
                <Typography.Body>Auto Endpoint Selection</Typography.Body>
                <Typography.Small className="text-gray-500">
                  Automatically switch to fastest endpoint
                </Typography.Small>
              </div>
              <input
                type="checkbox"
                checked={localConfig.autoEndpointSelection}
                onChange={(e) => setLocalConfig(prev => ({
                  ...prev,
                  autoEndpointSelection: e.target.checked
                }))}
              />
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div>
                <Typography.Body>Transaction Retry</Typography.Body>
                <Typography.Small className="text-gray-500">
                  Retry failed transactions automatically
                </Typography.Small>
              </div>
              <select
                value={localConfig.transactionRetry}
                onChange={(e) => setLocalConfig(prev => ({
                  ...prev,
                  transactionRetry: Number(e.target.value)
                }))}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
              >
                <option value="0">Disabled</option>
                <option value="1">1 retry</option>
                <option value="2">2 retries</option>
                <option value="3">3 retries</option>
              </select>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div>
                <Typography.Body>Broadcast Mode</Typography.Body>
                <Typography.Small className="text-gray-500">
                  Transaction broadcast strategy
                </Typography.Small>
              </div>
              <select
                value={localConfig.broadcastMode}
                onChange={(e) => setLocalConfig(prev => ({
                  ...prev,
                  broadcastMode: e.target.value
                }))}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
              >
                <option value="single">Single Node</option>
                <option value="redundant">Redundant</option>
                <option value="sequential">Sequential</option>
              </select>
            </div>
          </div>
        </div>

        {/* Network Info */}
        <div className="p-4 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-primary" />
            <Typography.Label>Network Information</Typography.Label>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Typography.Small className="text-gray-500">Network</Typography.Small>
              <Typography.Body>WAX Mainnet</Typography.Body>
            </div>
            <div className="flex justify-between">
              <Typography.Small className="text-gray-500">Chain ID</Typography.Small>
              <Typography.Body className="font-mono">1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4</Typography.Body>
            </div>
            <div className="flex justify-between">
              <Typography.Small className="text-gray-500">Core Token</Typography.Small>
              <Typography.Body>WAX</Typography.Body>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NetworkSettings;