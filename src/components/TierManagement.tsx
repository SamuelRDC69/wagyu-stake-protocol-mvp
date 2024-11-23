import React, { useState } from 'react';
import { Layers, Plus, Trash2 } from 'lucide-react';

interface TierEntity {
  id?: string;
  tier: string;
  tier_name: string;
  weight: number;
  staked_up_to_percent: number;
}

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
    weight: 1,
    staked_up_to_percent: 0
  });

  // Store input values separately to allow for partial input
  const [inputValues, setInputValues] = useState({
    weight: '1.00000000',
    staked_up_to_percent: '0.00000000'
  });

  const [errors, setErrors] = useState({
    weight: '',
    staked_up_to_percent: ''
  });

  const validateDecimalInput = (value: string, field: 'weight' | 'staked_up_to_percent'): boolean => {
    // Allow empty or partial decimal input (like "0." or ".")
    if (value === '' || value === '.') {
      return true;
    }

    const decimalRegex = /^\d*\.?\d{0,8}$/;
    if (!decimalRegex.test(value)) {
      setErrors(prev => ({
        ...prev,
        [field]: 'Please enter a valid number with up to 8 decimal places'
      }));
      return false;
    }

    const numValue = parseFloat(value);
    
    // Allow any decimal input but validate the final number
    if (field === 'weight' && numValue !== 0 && (numValue <= 0 || numValue > 10)) {
      setErrors(prev => ({
        ...prev,
        weight: 'Weight must be between 0 and 10'
      }));
      return false;
    }

    if (field === 'staked_up_to_percent' && numValue !== 0 && (numValue < 0 || numValue > 100)) {
      setErrors(prev => ({
        ...prev,
        staked_up_to_percent: 'Percentage must be between 0 and 100'
      }));
      return false;
    }

    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
    return true;
  };

  const handleDecimalInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'weight' | 'staked_up_to_percent'
  ) => {
    const value = e.target.value;
    
    if (validateDecimalInput(value, field)) {
      // Update the display value
      setInputValues(prev => ({
        ...prev,
        [field]: value
      }));
      
      // Only update the actual value if it's a valid number
      if (value !== '' && value !== '.') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          setNewTier(prev => ({
            ...prev,
            [field]: numValue
          }));
        }
      }
    }
  };

  const formatDecimalValue = (value: number): string => {
    return value.toFixed(8);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await onAddTier(newTier);
    
    setNewTier({
      tier: '',
      tier_name: '',
      weight: 1,
      staked_up_to_percent: 0
    });
    
    setInputValues({
      weight: '1.00000000',
      staked_up_to_percent: '0.00000000'
    });
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Layers className="w-5 h-5 text-purple-400"/>
        <h2 className="text-lg font-medium">Tier Management</h2>
      </div>

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
              type="text"
              inputMode="decimal"
              value={inputValues.weight}
              onChange={(e) => handleDecimalInput(e, 'weight')}
              className={`w-full bg-slate-900 rounded-lg px-3 py-2 text-white ${
                errors.weight ? 'border border-red-500' : ''
              }`}
              placeholder="e.g., 1.00000000"
              required
            />
            {errors.weight ? (
              <p className="mt-1 text-xs text-red-400">{errors.weight}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                Enter a value between 0 and 10 with up to 8 decimal places
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Staked Up To %
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={inputValues.staked_up_to_percent}
              onChange={(e) => handleDecimalInput(e, 'staked_up_to_percent')}
              className={`w-full bg-slate-900 rounded-lg px-3 py-2 text-white ${
                errors.staked_up_to_percent ? 'border border-red-500' : ''
              }`}
              placeholder="e.g., 25.00000000"
              required
            />
            {errors.staked_up_to_percent ? (
              <p className="mt-1 text-xs text-red-400">{errors.staked_up_to_percent}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                Enter a percentage between 0 and 100 with up to 8 decimal places
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !!errors.weight || !!errors.staked_up_to_percent}
          className={`w-full px-4 py-2 bg-purple-600 rounded-lg flex items-center justify-center gap-2 ${
            loading || !!errors.weight || !!errors.staked_up_to_percent
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-purple-700'
          }`}
        >
          <Plus className="w-4 h-4"/>
          Add Tier
        </button>
      </form>

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
                  Weight: {formatDecimalValue(tier.weight)}x | Up to {formatDecimalValue(tier.staked_up_to_percent)}%
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