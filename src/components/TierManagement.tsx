import React, { useState } from 'react';
import { Layers, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { TierEntity } from '../config/types'; // Changed from contract

interface TierManagementProps {
  tiers: TierEntity[];
  onAddTier: (tier: Omit<TierEntity, 'id'>) => Promise<void>;
  onRemoveTier: (tier: string) => Promise<void>;
  loading?: boolean;
}

const TierManagement = ({ tiers, onAddTier, onRemoveTier, loading }: TierManagementProps) => {
  const [newTier, setNewTier] = useState({
    tier: '',
    tier_name: '',
    weight: 1.0,
    staked_up_to_percent: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddTier(newTier);
    setNewTier({
      tier: '',
      tier_name: '',
      weight: 1.0,
      staked_up_to_percent: 0
    });
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Layers className="w-5 h-5 text-purple-400"/>
        <h2 className="text-lg font-medium">Tier Management</h2>
      </div>

      {/* New Tier Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Tier Name (system)
            </label>
            <input
              type="text"
              value={newTier.tier}
              onChange={(e) => setNewTier({ ...newTier, tier: e.target.value })}
              className="w-full bg-slate-900 rounded-lg px-3 py-2 text-white"
              placeholder="e.g., bronze"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Must be a valid EOSIO name (a-z, 1-5, max 12 chars)
            </p>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={newTier.tier_name}
              onChange={(e) => setNewTier({ ...newTier, tier_name: e.target.value })}
              className="w-full bg-slate-900 rounded-lg px-3 py-2 text-white"
              placeholder="e.g., Bronze Tier"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Weight Multiplier
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={newTier.weight}
              onChange={(e) => setNewTier({ ...newTier, weight: parseFloat(e.target.value) })}
              className="w-full bg-slate-900 rounded-lg px-3 py-2 text-white"
              placeholder="e.g., 1.0"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              1.0 = base rate, 1.5 = 50% bonus
            </p>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Staked Up To %
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={newTier.staked_up_to_percent}
              onChange={(e) => setNewTier({ ...newTier, staked_up_to_percent: parseFloat(e.target.value) })}
              className="w-full bg-slate-900 rounded-lg px-3 py-2 text-white"
              placeholder="e.g., 25"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Percentage of total pool stake required
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4"/>
          Add Tier
        </button>
      </form>

      {/* Existing Tiers */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-3">Active Tiers</h3>
        <div className="space-y-2">
          {tiers.map((tier) => (
            <div
              key={tier.tier}
              className="flex items-center justify-between bg-slate-900 p-3 rounded-lg"
            >
              <div>
                <p className="font-medium">{tier.tier_name}</p>
                <p className="text-sm text-slate-400">
                  Weight: {tier.weight}x | Up to {tier.staked_up_to_percent}%
                </p>
              </div>
              <button
                onClick={() => onRemoveTier(tier.tier)}
                disabled={loading}
                className="p-2 text-red-400 hover:text-red-300 rounded-lg"
              >
                <Trash2 className="w-4 h-4"/>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TierManagement;