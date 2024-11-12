import React, { useState } from 'react';
import { Database, Plus, Trash2, Power, PowerOff } from 'lucide-react';
import { PoolEntity, formatAsset } from '../config/contract';

interface PoolManagementProps {
  pools: PoolEntity[];
  onAddPool: (pool: Omit<PoolEntity, 'pool_id' | 'is_active'>) => Promise<void>;
  onRemovePool: (poolId: number) => Promise<void>;
  onToggleActive: (poolId: number, active: boolean) => Promise<void>;
  loading?: boolean;
}

const PoolManagement = ({ pools, onAddPool, onRemovePool, onToggleActive, loading }: PoolManagementProps) => {
  const [newPool, setNewPool] = useState({
    staked_token_contract: '',
    staked_token_symbol: '',
    total_staked_quantity: '',
    total_staked_weight: '',
    reward_pool: {
      quantity: '',
      contract: ''
    },
    emission_unit: 86400, // 1 day in seconds
    emission_rate: 100,
    last_emission_updated_at: new Date().toISOString()
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddPool(newPool);
    setNewPool({
      staked_token_contract: '',
      staked_token_symbol: '',
      total_staked_quantity: '',
      total_staked_weight: '',
      reward_pool: {
        quantity: '',
        contract: ''
      },
      emission_unit: 86400,
      emission_rate: 100,
      last_emission_updated_at: new Date().toISOString()
    });
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="w-5 h-5 text-blue-400"/>
        <h2 className="text-lg font-medium">Pool Management</h2>
      </div>

      {/* New Pool Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Token Contract
            </label>
            <input
              type="text"
              value={newPool.staked_token_contract}
              onChange={(e) => setNewPool({ ...newPool, staked_token_contract: e.target.value })}
              className="w-full bg-slate-900 rounded-lg px-3 py-2 text-white"
              placeholder="e.g., eosio.token"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Token Symbol
            </label>
            <input
              type="text"
              value={newPool.staked_token_symbol}
              onChange={(e) => setNewPool({ ...newPool, staked_token_symbol: e.target.value })}
              className="w-full bg-slate-900 rounded-lg px-3 py-2 text-white"
              placeholder="e.g., 4,EOS"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Total Staked Weight
            </label>
            <input
              type="text"
              value={newPool.total_staked_weight}
              onChange={(e) => setNewPool({ ...newPool, total_staked_weight: e.target.value })}
              className="w-full bg-slate-900 rounded-lg px-3 py-2 text-white"
              placeholder="e.g., 100000.0000 EOS"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Reward Pool
            </label>
            <input
              type="text"
              value={newPool.reward_pool.quantity}
              onChange={(e) => setNewPool({
                ...newPool,
                reward_pool: { ...newPool.reward_pool, quantity: e.target.value }
              })}
              className="w-full bg-slate-900 rounded-lg px-3 py-2 text-white"
              placeholder="e.g., 10000.0000 EOS@eosio.token"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Emission Unit (seconds)
            </label>
            <input
              type="number"
              value={newPool.emission_unit}
              onChange={(e) => setNewPool({ ...newPool, emission_unit: parseInt(e.target.value) })}
              className="w-full bg-slate-900 rounded-lg px-3 py-2 text-white"
              min="1"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              86400 = daily, 3600 = hourly
            </p>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Emission Rate
            </label>
            <input
              type="number"
              value={newPool.emission_rate}
              onChange={(e) => setNewPool({ ...newPool, emission_rate: parseInt(e.target.value) })}
              className="w-full bg-slate-900 rounded-lg px-3 py-2 text-white"
              min="1"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4"/>
          Create Pool
        </button>
      </form>

      {/* Active Pools */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-3">Active Pools</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-400">
                <th className="pb-2">ID</th>
                <th className="pb-2">Token</th>
                <th className="pb-2">Total Staked</th>
                <th className="pb-2">Rewards</th>
                <th className="pb-2">Emission</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {pools.map((pool) => (
                <tr key={pool.pool_id} className="border-t border-slate-700">
                  <td className="py-3">{pool.pool_id}</td>
                  <td className="py-3">{`${pool.staked_token_contract}`}</td>
                  <td className="py-3">{formatAsset(pool.total_staked_quantity).formatted}</td>
                  <td className="py-3">{formatAsset(pool.reward_pool.quantity).formatted}</td>
                  <td className="py-3">
                    {pool.emission_rate}/{pool.emission_unit}s
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      pool.is_active
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-red-900/50 text-red-400'
                    }`}>
                      {pool.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleActive(pool.pool_id, !pool.is_active)}
                        disabled={loading}
                        className={`p-2 rounded-lg ${
                          pool.is_active
                            ? 'text-red-400 hover:bg-red-900/20'
                            : 'text-green-400 hover:bg-green-900/20'
                        }`}
                      >
                        {pool.is_active ? <PowerOff className="w-4 h-4"/> : <Power className="w-4 h-4"/>}
                      </button>
                      <button
                        onClick={() => onRemovePool(pool.pool_id)}
                        disabled={loading}
                        className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PoolManagement;