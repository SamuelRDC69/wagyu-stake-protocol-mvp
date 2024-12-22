import React, { useState } from 'react';
import { Database, Plus, Trash2, Power, PowerOff } from 'lucide-react';
import { PoolEntity } from '../config/types';
import { formatAsset } from '../config/contract';

interface PoolManagementProps {
  pools: PoolEntity[];
  onAddPool: (pool: Omit<PoolEntity, 'pool_id' | 'is_active'>) => Promise<void>;
  onRemovePool: (poolId: number) => Promise<void>;
  onToggleActive: (poolId: number, active: boolean) => Promise<void>;
  onUpdatePoolWeight: (poolId: number, weight: string) => Promise<void>;
  loading?: boolean;
}

const PoolManagement = ({ 
  pools, 
  onAddPool, 
  onRemovePool, 
  onToggleActive,
  onUpdatePoolWeight, 
  loading 
}: PoolManagementProps) => {
  const [newPool, setNewPool] = useState({
    staked_token_contract: '',
    staked_token_symbol: '',
    total_staked_quantity: '0.00000000 WAX',
    total_staked_weight: '',
    reward_pool: {
      quantity: '',
      contract: 'eosio.token'
    },
    emission_unit: 86400,
    emission_rate: 0,
    emission_start_at: new Date(Date.now() + 300000).toISOString(), // 5 minutes in future
    emission_end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    last_emission_updated_at: new Date().toISOString()
  });

  const [emissionRateInput, setEmissionRateInput] = useState('0.00000000');
  const [weightUpdateForm, setWeightUpdateForm] = useState({
    poolId: '',
    weight: ''
  });

  const validateEmissionRate = (value: string): boolean => {
    if (value === '' || value === '.') return true;
    const decimalRegex = /^\d*\.?\d{0,8}$/;
    return decimalRegex.test(value) && parseFloat(value) >= 0;
  };

  const formatTimePoint = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Ensure date is in the future
    if (date <= now) {
      date.setMinutes(now.getMinutes() + 5);
    }
    
    // Convert to microseconds and ensure it's a string
    return (BigInt(date.getTime()) * BigInt(1000)).toString();
  };

  const formatEmissionRateForChain = (value: string): number => {
    const amount = parseFloat(value || '0');
    return Math.floor(amount * 100000000); // 8 decimals precision
  };

  const validatePoolData = (data: typeof newPool): void => {
    const startDate = new Date(data.emission_start_at);
    const endDate = new Date(data.emission_end_at);
    const now = new Date();

    if (startDate <= now) {
      throw new Error('Emission start time must be in the future');
    }

    if (endDate <= startDate) {
      throw new Error('Emission end time must be after start time');
    }

    if (!data.staked_token_symbol.includes(',')) {
      throw new Error('Token symbol must include precision (e.g., 8,WAX)');
    }
  };

  const formatPoolData = (data: typeof newPool): Omit<PoolEntity, 'pool_id' | 'is_active'> => {
    const symbol = data.staked_token_symbol.toUpperCase();
    
    const total_staked_weight = data.total_staked_weight.includes(' ') 
      ? data.total_staked_weight.split(' ').map((part: string, i: number) => {
          if (i === 0) return parseFloat(part).toFixed(8);
          return part.toUpperCase();
        }).join(' ')
      : `${parseFloat(data.total_staked_weight).toFixed(8)} WAX`;

    const [amount, symbol_contract] = (data.reward_pool.quantity || '').split('@');
    const [quantity_amount = '0', quantity_symbol = 'WAX'] = (amount || '').split(' ');
    const formatted_reward_pool = {
      quantity: `${parseFloat(quantity_amount).toFixed(8)} ${quantity_symbol.toUpperCase()}`,
      contract: data.reward_pool.contract || 'eosio.token'
    };

    return {
      staked_token_contract: data.staked_token_contract,
      staked_token_symbol: symbol,
      total_staked_quantity: '0.00000000 WAX',
      total_staked_weight,
      reward_pool: formatted_reward_pool,
      emission_unit: data.emission_unit,
      emission_rate: data.emission_rate,
      emission_start_at: formatTimePoint(data.emission_start_at),
      emission_end_at: formatTimePoint(data.emission_end_at),
      last_emission_updated_at: formatTimePoint(data.last_emission_updated_at)
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate data first
      validatePoolData(newPool);
      console.log('Pool data validation passed');

      const formattedData = formatPoolData(newPool);
      console.log('Formatted pool data:', formattedData);

      await onAddPool(formattedData);
      console.log('Pool created successfully');
      
      // Reset form
      setNewPool({
        staked_token_contract: '',
        staked_token_symbol: '',
        total_staked_quantity: '0.00000000 WAX',
        total_staked_weight: '',
        reward_pool: {
          quantity: '',
          contract: 'eosio.token'
        },
        emission_unit: 86400,
        emission_rate: 0,
        emission_start_at: new Date(Date.now() + 300000).toISOString(), // 5 minutes in future
        emission_end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        last_emission_updated_at: new Date().toISOString()
      });
      setEmissionRateInput('0.00000000');
    } catch (e) {
      console.error('Error creating pool:', e);
      alert(e instanceof Error ? e.message : 'An error occurred');
    }
  };

 return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="w-5 h-5 text-blue-400"/>
        <h2 className="text-lg font-medium">Pool Management</h2>
      </div>

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
              onChange={(e) => setNewPool({ 
                ...newPool, 
                staked_token_symbol: e.target.value.toUpperCase()
              })}
              className="w-full bg-slate-900 rounded-lg px-3 py-2 text-white"
              placeholder="e.g., 8,WAX"
              pattern="[0-9]+,[A-Z]+"
              title="Format: precision,SYMBOL (e.g., 8,WAX)"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Format: precision,SYMBOL (e.g., 8,WAX)
            </p>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Total Staked Weight
            </label>
            <input
              type="text"
              value={newPool.total_staked_weight}
              onChange={(e) => setNewPool({ 
                ...newPool, 
                total_staked_weight: e.target.value 
              })}
              className="w-full bg-slate-900 rounded-lg px-3 py-2 text-white"
              placeholder="e.g., 100000.00000000 WAX"
              pattern="[0-9]+\.[0-9]+ [A-Z]+"
              title="Format: amount SYMBOL (e.g., 100000.00000000 WAX)"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Format: amount SYMBOL (e.g., 100000.00000000 WAX)
            </p>
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
                reward_pool: { 
                  ...newPool.reward_pool, 
                  quantity: e.target.value,
                  contract: 'eosio.token'
                }
              })}
              className="w-full bg-slate-900 rounded-lg px-3 py-2 text-white"
              placeholder="e.g., 10000.00000000 WAX@eosio.token"
              pattern="[0-9]+\.[0-9]+ [A-Z]+@[a-z1-5\.]+"
              title="Format: amount SYMBOL@contract (e.g., 10000.00000000 WAX@eosio.token)"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Format: amount SYMBOL@contract (e.g., 10000.00000000 WAX@eosio.token)
            </p>
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
              type="text"
              value={emissionRateInput}
              onChange={(e) => {
                const value = e.target.value;
                if (validateEmissionRate(value)) {
                  setEmissionRateInput(value);
                  if (value !== '' && value !== '.') {
                    const chainValue = formatEmissionRateForChain(value);
                    setNewPool({
                      ...newPool,
                      emission_rate: chainValue
                    });
                  }
                }
              }}
              className="w-full bg-slate-900 rounded-lg px-3 py-2 text-white"
              placeholder="e.g., 0.05500000"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Enter amount with up to 8 decimal places (e.g., 0.05500000)
            </p>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Emission Start Date
            </label>
            <input
              type="datetime-local"
              value={newPool.emission_start_at.slice(0, 16)} 
              onChange={(e) => setNewPool({
                ...newPool,
                emission_start_at: new Date(e.target.value).toISOString()
              })}
              className="w-full bg-slate-900 rounded-lg px-3 py-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Emission End Date
            </label>
            <input
              type="datetime-local"
              value={newPool.emission_end_at.slice(0, 16)}
              onChange={(e) => setNewPool({
                ...newPool,
                emission_end_at: new Date(e.target.value).toISOString()
              })}
              className="w-full bg-slate-900 rounded-lg px-3 py-2 text-white"
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

      {/* Pool Weight Update Section */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <h3 className="text-sm font-medium mb-3">Update Pool Weight</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Pool ID</label>
            <input
              type="number"
              className="w-full bg-slate-900 rounded-lg px-3 py-2 text-white"
              placeholder="Enter pool ID"
              value={weightUpdateForm.poolId}
              onChange={(e) => setWeightUpdateForm({
                ...weightUpdateForm,
                poolId: e.target.value
              })}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">New Weight</label>
            <input
              type="text"
              className="w-full bg-slate-900 rounded-lg px-3 py-2 text-white"
              placeholder="e.g., 100.0000 WAX"
              value={weightUpdateForm.weight}
              onChange={(e) => setWeightUpdateForm({
                ...weightUpdateForm,
                weight: e.target.value
              })}
            />
          </div>
        </div>
        <button
          onClick={() => {
            if (weightUpdateForm.poolId && weightUpdateForm.weight) {
              onUpdatePoolWeight(parseInt(weightUpdateForm.poolId), weightUpdateForm.weight);
              setWeightUpdateForm({ poolId: '', weight: '' });
            }
          }}
          disabled={loading || !weightUpdateForm.poolId || !weightUpdateForm.weight}
          className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Update Pool Weight
        </button>
      </div>

      {/* Active Pools */}
      <div className="mt-8">
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
                    {(pool.emission_rate / 100000000).toFixed(8)}/{pool.emission_unit}s
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
