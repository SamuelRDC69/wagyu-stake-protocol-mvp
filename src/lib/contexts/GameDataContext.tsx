import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { PoolEntity, StakedEntity, TierEntity, ConfigEntity } from '../types';
import { parseTokenString } from '../utils/tokenUtils';

interface GameDataState {
  pools: PoolEntity[];
  stakes: StakedEntity[];
  tiers: TierEntity[];
  config: ConfigEntity | undefined;
}

interface GameDataContextType {
  gameData: GameDataState;
  updatePoolStats: (poolId: number, updates: Partial<PoolEntity>) => void;
  updateStake: (poolId: number, owner: string, updates: Partial<StakedEntity>) => void;
  removeStake: (poolId: number, owner: string) => void;
  setGameData: (data: GameDataState) => void;
}

type GameDataAction = 
  | { type: 'SET_GAME_DATA'; payload: GameDataState }
  | { type: 'UPDATE_POOL'; payload: { poolId: number; updates: Partial<PoolEntity> } }
  | { type: 'UPDATE_STAKE'; payload: { poolId: number; owner: string; updates: Partial<StakedEntity> } }
  | { type: 'REMOVE_STAKE'; payload: { poolId: number; owner: string } };

function gameDataReducer(state: GameDataState, action: GameDataAction): GameDataState {
  switch (action.type) {
    case 'SET_GAME_DATA':
      return action.payload;
      
    case 'UPDATE_POOL':
      return {
        ...state,
        pools: state.pools.map(pool => 
          pool.pool_id === action.payload.poolId
            ? { ...pool, ...action.payload.updates }
            : pool
        )
      };
      
    case 'UPDATE_STAKE':
      return {
        ...state,
        stakes: state.stakes.map(stake =>
          stake.pool_id === action.payload.poolId && stake.owner === action.payload.owner
            ? { ...stake, ...action.payload.updates }
            : stake
        )
      };
      
    case 'REMOVE_STAKE':
      return {
        ...state,
        stakes: state.stakes.filter(stake =>
          !(stake.pool_id === action.payload.poolId && stake.owner === action.payload.owner)
        )
      };

    default:
      return state;
  }
}

export const GameDataContext = createContext<GameDataContextType | undefined>(undefined);

export function GameDataProvider({ children }: { children: React.ReactNode }) {
  const [gameData, dispatch] = useReducer(gameDataReducer, {
    pools: [],
    stakes: [],
    tiers: [],
    config: undefined
  });

  const updatePoolStats = useCallback((poolId: number, updates: Partial<PoolEntity>) => {
    dispatch({ type: 'UPDATE_POOL', payload: { poolId, updates } });
  }, []);

  const updateStake = useCallback((poolId: number, owner: string, updates: Partial<StakedEntity>) => {
    dispatch({ type: 'UPDATE_STAKE', payload: { poolId, owner, updates } });
  }, []);

  const removeStake = useCallback((poolId: number, owner: string) => {
    dispatch({ type: 'REMOVE_STAKE', payload: { poolId, owner } });
  }, []);

  const setGameData = useCallback((data: GameDataState) => {
    dispatch({ type: 'SET_GAME_DATA', payload: data });
  }, []);

  return (
    <GameDataContext.Provider value={{
      gameData,
      updatePoolStats,
      updateStake,
      removeStake,
      setGameData
    }}>
      {children}
    </GameDataContext.Provider>
  );
}

export function useGameData() {
  const context = useContext(GameDataContext);
  if (!context) {
    throw new Error('useGameData must be used within a GameDataProvider');
  }
  return context;
}