import { useStakeToken } from './useStakeToken';
import { useUnstake } from './useUnstake';
import { useClaim } from './useClaim';

export function useStakingActions() {
  const { stake, isProcessing: isStaking } = useStakeToken();
  const { unstake, isProcessing: isUnstaking } = useUnstake();
  const { 
    claim, 
    canClaim, 
    timeUntilClaim, 
    isProcessing: isClaiming 
  } = useClaim();

  const isProcessing = isStaking || isUnstaking || isClaiming;

  return {
    stake,
    unstake,
    claim,
    canClaim,
    timeUntilClaim,
    isProcessing,
    isStaking,
    isUnstaking,
    isClaiming
  };
}