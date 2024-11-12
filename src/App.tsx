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
import TierManagement from './components/TierManagement'
import PoolManagement from './components/PoolManagement'
import { toast } from '@/components/ui/toast'

function App() {
  const { session, login, logout, loading: sessionLoading } = useSession()
  const { loading: contractLoading, error, actions, queries } = useContract(session)
  
  const [config, setConfig] = useState<ConfigState | null>(null)
  const [tiers, setTiers] = useState<TierEntity[]>([])
  const [pools, setPools] = useState<PoolEntity[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) {
      loadData()
    }
  }, [session])

  const loadData = async () => {
    try {
      setLoading(true)
      const [configData, tiersData, poolsData] = await Promise.all([
        queries.getConfig(),
        queries.getTiers(),
        queries.getPools()
      ])
      setConfig(configData)
      setTiers(tiersData)
      setPools(poolsData)
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to load data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMaintenanceToggle = async () => {
    if (!config) return
    
    try {
      setLoading(true)
      await actions.setMaintenance(!config.maintenance)
      toast({
        title: 'Success',
        description: `Maintenance mode ${config.maintenance ? 'disabled' : 'enabled'}`
      })
      await loadData()
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to toggle maintenance',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Tier Management Handlers
  const handleAddTier = async (tierData: Omit<TierEntity, 'id'>) => {
    try {
      setLoading(true)
      await actions.setTier(
        tierData.tier,
        tierData.tier_name,
        tierData.weight,
        tierData.staked_up_to_percent
      )
      toast({
        title: 'Success',
        description: `Tier ${tierData.tier_name} added successfully`
      })
      await loadData()
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to add tier',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveTier = async (tier: string) => {
    try {
      setLoading(true)
      await actions.removeTier(tier)
      toast({
        title: 'Success',
        description: `Tier ${tier} removed successfully`
      })
      await loadData()
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to remove tier',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Pool Management Handlers
  const handleAddPool = async (poolData: Omit<PoolEntity, 'pool_id' | 'is_active'>) => {
    try {
      setLoading(true)
      await actions.setPool(poolData)
      toast({
        title: 'Success',
        description: 'Pool created successfully'
      })
      await loadData()
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to create pool',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemovePool = async (poolId: number) => {
    try {
      setLoading(true)
      await actions.removePool(poolId)
      toast({
        title: 'Success',
        description: `Pool ${poolId} removed successfully`
      })
      await loadData()
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to remove pool',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePool = async (poolId: number, active: boolean) => {
    try {
      setLoading(true)
      await actions.setPoolActive(poolId, active)
      toast({
        title: 'Success',
        description: `Pool ${poolId} ${active ? 'activated' : 'deactivated'} successfully`
      })
      await loadData()
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to toggle pool status',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
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

        {/* Maintenance Warning */}
        {config?.maintenance && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400"/>
            <p className="text-red-400">
              Contract is in maintenance mode. All user actions are disabled.
            </p>
          </div>
        )}

        {/* Maintenance Toggle */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-red-400"/>
                <h3 className="font-medium">Maintenance Mode</h3>
              </div>
              <p className="text-sm text-slate-400">
                Temporarily disable all user actions
              </p>
            </div>
            <button
              onClick={handleMaintenanceToggle}
              disabled={loading}
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

        {/* Tier Management */}
        <div className="mb-6">
          <TierManagement
            tiers={tiers}
            onAddTier={handleAddTier}
            onRemoveTier={handleRemoveTier}
            loading={loading}
          />
        </div>

        {/* Pool Management */}
        <div className="mb-6">
          <PoolManagement
            pools={pools}
            onAddPool={handleAddPool}
            onRemovePool={handleRemovePool}
            onToggleActive={handleTogglePool}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}

export default App