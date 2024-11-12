import { useEffect, useState } from 'react'
import { useSession } from './hooks/useSession'
import { useContract } from './hooks/useContract'
import { ConfigState, PoolEntity, TierEntity } from './config/contract'
import { 
  Settings, 
  Shield, 
  Database,
  AlertTriangle,
  Layers,
  BarChart3
} from 'lucide-react'

function App() {
  const { session, login, logout, loading: sessionLoading } = useSession()
  const { loading: contractLoading, error, actions, queries } = useContract(session)
  
  const [config, setConfig] = useState<ConfigState | null>(null)
  const [stats, setStats] = useState<{
    pools: PoolEntity[];
    tiers: TierEntity[];
    totalStaked: number;
    totalRewards: number;
  } | null>(null)

  useEffect(() => {
    if (session) {
      loadData()
    }
  }, [session])

  const loadData = async () => {
    try {
      const [configData, statsData] = await Promise.all([
        queries.getConfig(),
        queries.getStats()
      ])
      setConfig(configData)
      setStats(statsData)
    } catch (e) {
      console.error('Failed to load data:', e)
    }
  }

  const handleMaintenanceToggle = async () => {
    if (!config) return
    
    try {
      await actions.setMaintenance(!config.maintenance)
      await loadData()
    } catch (e) {
      console.error('Failed to toggle maintenance:', e)
    }
  }

  if (sessionLoading || contractLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Stakeland Admin</h1>
          <button
            onClick={() => login()}
            className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Stakeland Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              {session.actor.toString()}
            </span>
            <button
              onClick={() => logout()}
              className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700"
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-blue-400"/>
                <h3 className="font-medium">Total Pools</h3>
              </div>
              <p className="text-2xl font-bold">{stats.pools.length}</p>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-5 h-5 text-purple-400"/>
                <h3 className="font-medium">Total Staked</h3>
              </div>
              <p className="text-2xl font-bold">
                {stats.totalStaked.toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-green-400"/>
                <h3 className="font-medium">Total Rewards</h3>
              </div>
              <p className="text-2xl font-bold text-green-400">
                {stats.totalRewards.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Maintenance Control */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-red-400"/>
                <h3 className="font-medium">Maintenance Mode</h3>
              </div>
              <p className="text-sm text-slate-400">
                {config?.maintenance ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <button
              onClick={handleMaintenanceToggle}
              className={`px-4 py-2 rounded-lg ${
                config?.maintenance 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {config?.maintenance ? 'Disable Maintenance' : 'Enable Maintenance'}
            </button>
          </div>
        </div>

        {/* Add more sections for tier management, pool management, etc. */}
      </div>
    </div>
  )
}

export default App